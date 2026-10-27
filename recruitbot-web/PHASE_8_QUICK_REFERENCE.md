# Phase 8 - Quick Reference Guide

## Testing Commands

### Start Backend
```powershell
cd c:\Users\FaithNhlamuloKubayi\Pictures\resume_rag
npm run dev
```

### Start Frontend
```powershell
cd c:\Users\FaithNhlamuloKubayi\Pictures\resume_rag\recruitbot-web
npm run dev
```

### Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## Test Scenarios Quick List

| Test # | Scenario | Expected Result | Retryable |
|--------|----------|----------------|-----------|
| 1 | Valid PDF upload | ✅ Success | N/A |
| 2 | Backend server down | ❌ Network error → 3 retries | ✅ Yes |
| 3 | 500 server error | ❌ Server error → 3 retries | ✅ Yes |
| 4 | 400 validation error | ❌ Validation error | ❌ No |
| 5 | 413 file too large | ❌ File size error | ❌ No |
| 6 | Request timeout | ❌ Timeout → 3 retries | ✅ Yes |
| 7 | PDF extraction failed | 🔧 Processing error (orange) | ✅ Yes |
| 8 | Resume parsing failed | 🔧 Processing error (red) | ✅ Yes |
| 9 | Embedding failed | 🔧 Processing error (purple) | ✅ Yes |
| 10 | Database storage failed | 🔧 Processing error (blue) | ✅ Yes |
| 11 | Manual retry after error | ✅ Retry works | N/A |
| 12 | Error dismissal | 🧹 Error clears | N/A |

---

## Backend Mock Code Templates

### Test 3: 500 Server Error
```typescript
// Add to ingestionController.ts uploadResume function
return res.status(500).json({ 
  error: 'Internal server error', 
  details: 'Database connection failed' 
});
```

### Test 4: 400 Validation Error
```typescript
return res.status(400).json({ 
  error: 'Invalid file format', 
  details: 'PDF appears to be corrupted' 
});
```

### Test 5: 413 File Too Large
```typescript
return res.status(413).json({ 
  error: 'File too large', 
  details: 'Maximum file size is 5 MB' 
});
```

### Test 7: PDF Extraction Failed
```typescript
return res.status(500).json({ 
  error: 'PDF extraction failed', 
  details: 'Unable to parse PDF structure',
  stage: 'extraction'
});
```

### Test 8: Resume Parsing Failed
```typescript
return res.status(500).json({ 
  error: 'Resume parsing failed', 
  details: 'Could not identify resume sections',
  stage: 'parsing'
});
```

### Test 9: Embedding Generation Failed
```typescript
return res.status(500).json({ 
  error: 'Embedding generation failed', 
  details: 'OpenAI API key invalid',
  stage: 'embedding'
});
```

### Test 10: Database Storage Failed
```typescript
return res.status(500).json({ 
  error: 'Database storage failed', 
  details: 'MongoDB connection lost',
  stage: 'storage'
});
```

### Test 6: Timeout (Slow Processing)
```typescript
// Add at start of uploadResume function
await new Promise(resolve => setTimeout(resolve, 65000)); // 65 seconds
```

---

## Retry Timing Reference

| Attempt | Delay | Total Time Elapsed |
|---------|-------|--------------------|
| 1st | 1 second | 0s |
| 2nd | 2 seconds | 1s |
| 3rd | 4 seconds | 3s |
| **Total** | **7 seconds** | **7s** |

---

## Error Category Colors

| Category | Background | Border | Text | Icon |
|----------|-----------|--------|------|------|
| **Error** | bg-red-500/10 | border-red-500/30 | text-red-400 | text-red-500 |
| **Warning** | bg-yellow-500/10 | border-yellow-500/30 | text-yellow-400 | text-yellow-500 |
| **Info** | bg-blue-500/10 | border-blue-500/30 | text-blue-400 | text-blue-500 |

---

## Processing Stage Colors

| Stage | Icon | Color | Background |
|-------|------|-------|------------|
| **Extraction** | FileSearch | text-orange-400 | bg-orange-500/10 |
| **Parsing** | FileX | text-red-400 | bg-red-500/10 |
| **Embedding** | Zap | text-purple-400 | bg-purple-500/10 |
| **Storage** | Database | text-blue-400 | bg-blue-500/10 |

---

## Expected Console Output

### Successful Upload
```
[API] POST /v1/resume/inject - 2341ms
Resume uploaded successfully!
```

### Network Error with Retry
```
[API Error] No response received ECONNREFUSED
Retrying in 1.0s... (Attempt 1/3)
[API Error] No response received ECONNREFUSED
Retrying in 2.0s... (Attempt 2/3)
[API Error] No response received ECONNREFUSED
Retrying in 4.0s... (Attempt 3/3)
Maximum retry attempts reached.
```

### Server Error
```
[API Error] 500 - /v1/resume/inject
{error: "Internal server error", details: "Database connection failed"}
Server error. Please try again later.
```

---

## Postman Collection

Import: `PHASE_8_POSTMAN_COLLECTION.json`

Contains all 12 test scenarios with:
- Pre-configured requests
- Expected responses
- Backend mock instructions
- Variable setup

---

## Acceptance Criteria Checklist

- [ ] **Backend Errors**
  - [ ] 500 errors retry 3 times
  - [ ] 400 errors do NOT retry
  - [ ] 413 errors do NOT retry
  - [ ] Error messages are user-friendly

- [ ] **Network Errors**
  - [ ] Connection refused detected
  - [ ] Timeout detected (60s)
  - [ ] Automatic retry with backoff
  - [ ] Manual retry works

- [ ] **Processing Errors**
  - [ ] Extraction stage shows orange
  - [ ] Parsing stage shows red
  - [ ] Embedding stage shows purple
  - [ ] Storage stage shows blue
  - [ ] Correct icons displayed

- [ ] **UI Behavior**
  - [ ] Error display shows correct icon
  - [ ] Retry button for retryable errors
  - [ ] No retry button for non-retryable
  - [ ] Dismiss button works
  - [ ] Toast notifications work
  - [ ] Retry countdown accurate

- [ ] **Integration**
  - [ ] Multiple retries work
  - [ ] Manual retry after auto-retry works
  - [ ] Error clears on success
  - [ ] Console logs show timing
  - [ ] Request IDs unique

---

## Troubleshooting

### Frontend won't start
```powershell
cd recruitbot-web
rm -rf node_modules
npm install
npm run dev
```

### Backend won't start
```powershell
cd c:\Users\FaithNhlamuloKubayi\Pictures\resume_rag
npm install
npm run dev
```

### Port already in use
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### CORS errors
- Ensure backend allows `http://localhost:5173`
- Check CORS middleware configuration

### TypeScript errors
```powershell
cd recruitbot-web
npm run build
```

---

## File Locations

### Error Handling Core
- `src/features/ingestion/types/errors.types.ts`
- `src/features/ingestion/utils/errorParser.ts`
- `src/features/ingestion/utils/retryHandler.ts`

### Components
- `src/features/ingestion/components/ErrorDisplay.tsx`
- `src/features/ingestion/components/ProcessingErrorCard.tsx`

### Hooks
- `src/features/ingestion/hooks/useUploadWithRetry.ts`

### API
- `src/lib/api/client.ts`
- `src/lib/api/ingestion.api.ts`

### Documentation
- `PHASE_8_IMPLEMENTATION.md` - Full implementation details
- `PHASE_8_POSTMAN_COLLECTION.json` - API tests
- `PHASE_8_QUICK_REFERENCE.md` - This file

---

## Next Steps

1. Test all 12 scenarios
2. Verify acceptance criteria
3. Check console logs
4. Confirm visual appearance
5. Test edge cases

Once all tests pass:
> **"Phase 8 tested and working, proceed to Phase 9"**

---

## Support

- Full testing guide: See artifact in chat
- Implementation details: `PHASE_8_IMPLEMENTATION.md`
- Postman collection: `PHASE_8_POSTMAN_COLLECTION.json`
