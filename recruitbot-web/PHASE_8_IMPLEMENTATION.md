# Phase 8 - Error Handling Implementation

## Overview

Phase 8 implements comprehensive error handling for the resume ingestion pipeline with:
- Backend error parsing and categorization
- Network error detection and recovery
- Automatic retry logic with exponential backoff
- Processing stage error display
- User-friendly error messages
- Manual retry capabilities

---

## Architecture

### Error Flow
```
Upload Attempt
    ↓
Try Request
    ↓
Error? ──No──> Success ✅
    ↓
   Yes
    ↓
Parse Error (ErrorParser)
    ↓
Categorize (network/server/validation/processing)
    ↓
Retryable? ──No──> Show Error (no retry button)
    ↓
   Yes
    ↓
Exponential Backoff (RetryHandler)
    ↓
Retry Attempt (max 3 times)
    ↓
Success? ──Yes──> Success ✅
    ↓
   No
    ↓
Show Error with Manual Retry
```

---

## Components

### 1. Error Parser (`errorParser.ts`)

**Purpose**: Parse any error into standardized `ApiError` format

**Features**:
- Detects Axios errors (response vs. network)
- Categorizes errors (network, server, validation, processing, unknown)
- Determines severity (error, warning, info)
- Decides if error is retryable
- Formats user-friendly messages

**Example Usage**:
```typescript
try {
  await uploadResume(file);
} catch (error) {
  const apiError = ErrorParser.parseError(error);
  console.log(apiError.category); // 'network' | 'server' | 'validation' | 'processing'
  console.log(apiError.retryable); // true | false
}
```

**Error Categories**:

| Category | HTTP Codes | Retryable | Icon |
|----------|-----------|-----------|------|
| **Network** | No response | ✅ Yes | WifiOff |
| **Server** | 500-599 | ✅ Yes | ServerCrash |
| **Validation** | 400-499 | ❌ No | XCircle |
| **Processing** | 500 (with stage) | ✅ Yes | AlertCircle |
| **Unknown** | Other | ❌ No | AlertTriangle |

---

### 2. Retry Handler (`retryHandler.ts`)

**Purpose**: Implements exponential backoff retry logic

**Configuration**:
```typescript
{
  maxRetries: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 10000,      // 10 seconds
  backoffMultiplier: 2
}
```

**Retry Delays**:
- Attempt 1: 1 second (1000ms)
- Attempt 2: 2 seconds (2000ms)
- Attempt 3: 4 seconds (4000ms)

**Example Usage**:
```typescript
const retryHandler = new RetryHandler({ maxRetries: 3 });

const result = await retryHandler.executeWithRetry(
  () => uploadResume(file),
  (retryCount, delay) => {
    console.log(`Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
  },
  (error, finalRetryCount) => {
    console.error('All retries failed:', error);
  }
);
```

---

### 3. Error Display Component (`ErrorDisplay.tsx`)

**Purpose**: Generic error display with retry options

**Features**:
- Icon changes based on error category
- Color-coded by severity (error/warning/info)
- Shows error message + details
- Retry button (if retryable)
- Dismiss button
- Retry countdown display

**Props**:
```typescript
interface ErrorDisplayProps {
  error: ApiError;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
}
```

**Visual States**:
```
┌─────────────────────────────────────────┐
│ 🌐 Network error                        │
│                                         │
│ Network error. Please check your       │
│ internet connection.                    │
│                                         │
│ ℹ️  Retrying in 2.0s... (Attempt 2/3)  │
│                                         │
│ [ Retry Upload ]  [ Dismiss ]     ✕    │
└─────────────────────────────────────────┘
```

---

### 4. Processing Error Card (`ProcessingErrorCard.tsx`)

**Purpose**: Shows which pipeline stage failed

**Stages**:
1. **Extraction** (FileSearch icon, orange)
2. **Parsing** (FileX icon, red)
3. **Embedding** (Zap icon, purple)
4. **Storage** (Database icon, blue)

**Example**:
```
┌─────────────────────────────────────────┐
│ 📄 PDF Extraction Failed                │
│ Failed to extract text from PDF        │
│                                         │
│ ⚠️  PDF extraction failed               │
│    Unable to parse PDF structure       │
│                                         │
│ [ Retry Upload ]                        │
└─────────────────────────────────────────┘
```

---

### 5. Upload Hook with Retry (`useUploadWithRetry.ts`)

**Purpose**: React hook combining upload + retry logic

**Features**:
- Automatic retry on network/server errors
- Manual retry capability
- Loading states (uploading, retrying)
- Error state management
- Toast notifications

**Example Usage**:
```typescript
const { upload, retry, clearError, isUploading, error, retryCount, canRetry } = 
  useUploadWithRetry(
    (file) => ingestionApi.uploadResume({ file }),
    {
      maxRetries: 3,
      onRetry: (count, delay) => console.log(`Retry ${count + 1}`),
      onError: (error, count) => console.error('Failed after retries'),
      onSuccess: (data) => console.log('Upload success!'),
    }
  );

// Upload file
await upload(selectedFile);

// Manual retry
if (canRetry) {
  await retry(selectedFile);
}
```

**Return Values**:
```typescript
{
  upload: (file: File) => Promise<any>,
  retry: (file: File) => Promise<void>,
  clearError: () => void,
  isUploading: boolean,
  error: ApiError | null,
  retryCount: number,
  isRetrying: boolean,
  canRetry: boolean
}
```

---

## Error Types

### ApiError
```typescript
interface ApiError {
  message: string;          // User-friendly message
  code?: string;            // Error code (e.g., 'HTTP_500', 'NETWORK_ERROR')
  details?: string;         // Technical details
  severity: ErrorSeverity;  // 'error' | 'warning' | 'info'
  category: ErrorCategory;  // 'network' | 'server' | 'validation' | 'processing' | 'unknown'
  retryable: boolean;       // Can this error be retried?
  timestamp: Date;          // When error occurred
}
```

### ProcessingError
```typescript
interface ProcessingError {
  stage: 'extraction' | 'parsing' | 'embedding' | 'storage';
  message: string;
  details?: string;
  retryable: boolean;
}
```

### BackendErrorResponse
```typescript
interface BackendErrorResponse {
  success: false;
  error: string;           // Error message
  details?: string;        // Additional details
  code?: string;           // Error code
  statusCode?: number;     // HTTP status code
  requestId?: string;      // Request ID for tracking
  stage?: string;          // Pipeline stage (for processing errors)
}
```

---

## Integration Example

### Complete Upload Flow with Error Handling

```typescript
import { useUploadWithRetry } from '@/features/ingestion/hooks/useUploadWithRetry';
import { ingestionApi } from '@/lib/api/ingestion.api';
import { ErrorDisplay } from '@/features/ingestion/components/ErrorDisplay';
import { ProcessingErrorCard } from '@/features/ingestion/components/ProcessingErrorCard';

function UploadPage() {
  const { 
    upload, 
    retry, 
    clearError, 
    isUploading, 
    error, 
    retryCount,
    canRetry 
  } = useUploadWithRetry(
    (file) => ingestionApi.uploadResume({ file }),
    {
      maxRetries: 3,
      onSuccess: (data) => {
        console.log('Uploaded:', data.data.candidateId);
      }
    }
  );

  const handleFileSelect = async (file: File) => {
    await upload(file);
  };

  return (
    <div>
      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          retryCount={retryCount}
          maxRetries={3}
          onRetry={() => retry(selectedFile)}
          onDismiss={clearError}
        />
      )}

      {/* Processing Error (if stage is specified) */}
      {error?.category === 'processing' && (
        <ProcessingErrorCard
          error={{
            stage: error.stage,
            message: error.message,
            details: error.details,
            retryable: error.retryable
          }}
          onRetry={() => retry(selectedFile)}
        />
      )}

      {/* Upload Button */}
      <button 
        onClick={() => handleFileSelect(file)}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </div>
  );
}
```

---

## Error Message Examples

### Network Errors
```
❌ Network error. Please check your internet connection.
❌ Request timed out. Please check your connection and try again.
```

### Server Errors
```
❌ Server error. Please try again later.
❌ Service unavailable. Please try again later.
❌ Gateway timeout. The server took too long to respond.
```

### Validation Errors
```
❌ Invalid request. Please check your file and try again.
❌ File too large. Maximum size is 5 MB.
❌ Unsupported file type. Only PDF files are allowed.
```

### Processing Errors
```
❌ PDF extraction failed. Unable to parse PDF structure.
❌ Resume parsing failed. Could not identify resume sections.
❌ Embedding generation failed. OpenAI API key invalid.
❌ Database storage failed. MongoDB connection lost.
```

---

## Testing Checklist

### Backend Error Testing
- [ ] 500 server error triggers retry (3 attempts)
- [ ] 502 bad gateway triggers retry
- [ ] 503 service unavailable triggers retry
- [ ] 504 gateway timeout triggers retry
- [ ] 400 validation error does NOT retry
- [ ] 413 file too large does NOT retry
- [ ] Error messages are user-friendly

### Network Error Testing
- [ ] Connection refused detected
- [ ] Timeout detected (60s)
- [ ] Network errors trigger automatic retry
- [ ] Exponential backoff delays work (1s, 2s, 4s)
- [ ] Manual retry works after network restoration

### Processing Error Testing
- [ ] Extraction stage errors display correctly
- [ ] Parsing stage errors display correctly
- [ ] Embedding stage errors display correctly
- [ ] Storage stage errors display correctly
- [ ] Stage-specific icons and colors shown

### UI Testing
- [ ] Error display component shows correct icon
- [ ] Error severity affects color (error/warning/info)
- [ ] Retry button shows for retryable errors
- [ ] Retry button hidden for non-retryable errors
- [ ] Dismiss button clears error state
- [ ] Toast notifications appear
- [ ] Retry countdown displays correctly

### Integration Testing
- [ ] Multiple retries work correctly
- [ ] Manual retry after auto-retry failure works
- [ ] Error clears on successful retry
- [ ] Console logs show request timing
- [ ] Request IDs are unique per request

---

## Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=60000
```

### Retry Configuration
```typescript
// Default config
{
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
}

// Custom config
const retryHandler = new RetryHandler({
  maxRetries: 5,          // More retries
  baseDelay: 2000,        // Longer initial delay
  maxDelay: 30000,        // Longer max delay
  backoffMultiplier: 1.5  // Slower backoff
});
```

### API Client Configuration
```typescript
// client.ts
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 60000,  // 60 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## Debugging

### Console Logs

**Successful Request:**
```
[API] POST /v1/resume/inject - 2341ms
```

**Network Error:**
```
[API Error] No response received ECONNREFUSED
Retrying in 1.0s... (Attempt 1/3)
Retrying in 2.0s... (Attempt 2/3)
Retrying in 4.0s... (Attempt 3/3)
```

**Server Error:**
```
[API Error] 500 - /v1/resume/inject
{
  error: "Internal server error",
  details: "Database connection failed"
}
```

### Browser DevTools

1. **Network Tab**: Check request/response
2. **Console Tab**: View error logs and timing
3. **Application Tab**: Check localStorage/state

---

## Production Considerations

### Error Tracking
- Integrate Sentry/LogRocket for error monitoring
- Send error events to analytics
- Track retry success rates

### Rate Limiting
- Implement client-side rate limiting
- Add jitter to retry delays
- Respect 429 (Too Many Requests) responses

### User Experience
- Show progress during retries
- Provide clear next steps
- Offer support links for persistent errors

### Backend Requirements
- Return consistent error format
- Include `stage` field for processing errors
- Use standard HTTP status codes
- Include request IDs for debugging

---

## Files Created

```
src/
├── features/ingestion/
│   ├── components/
│   │   ├── ErrorDisplay.tsx
│   │   └── ProcessingErrorCard.tsx
│   ├── hooks/
│   │   └── useUploadWithRetry.ts
│   ├── types/
│   │   └── errors.types.ts
│   └── utils/
│       ├── errorParser.ts
│       └── retryHandler.ts
└── lib/api/
    ├── client.ts
    └── ingestion.api.ts
```

---

## Next Phase

After Phase 8 approval, Phase 9 will implement:
- Final end-to-end validation
- Integration testing
- Resume searchability verification
- Success state confirmation

---

**Phase 8 Status**: ✅ Implementation Complete - Ready for Testing
