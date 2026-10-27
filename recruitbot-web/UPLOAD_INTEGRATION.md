# Resume Upload Integration

## Overview
Integrated inline resume upload functionality directly into the main search page, allowing users to upload PDF resumes without leaving the interface.

## Implementation Details

### 1. UI Store Updates (`src/lib/stores/ui.store.ts`)
Added upload modal state management:
- `uploadModalOpen: boolean` - Tracks modal visibility
- `openUploadModal()` - Opens the upload modal
- `closeUploadModal()` - Closes the upload modal

### 2. Sidebar Component (`src/components/layout/Sidebar.tsx`)
- Added "Upload Resume" button above the footer
- Button triggers `openUploadModal()` from UI store
- Styled with primary accent color for visibility

### 3. Mobile Drawer Component (`src/components/layout/MobileDrawer.tsx`)
- Added "Upload Resume" button for mobile users
- Closes drawer when upload is clicked
- Then opens upload modal for seamless UX

### 4. Search Page (`src/pages/SearchPage.tsx`)
- Imported and rendered `<UploadModal />` component
- Modal is available throughout the search interface
- Doesn't require navigation to separate route

### 5. Upload Modal Component (`src/components/upload/UploadModal.tsx`)
Features:
- **Drag & Drop**: Users can drag PDF files into the modal
- **File Browser**: Click to browse and select files
- **Validation**: 
  - Only PDF files accepted
  - Maximum 5MB file size
  - Clear error messages for invalid files
- **Upload Progress**: Shows "Uploading..." state during upload
- **Success State**: Displays success animation and auto-closes
- **Error Handling**: Shows error messages from backend
- **Toast Notifications**: Success/error toasts using react-hot-toast

## User Flow

### Desktop
1. User clicks "Upload Resume" button in left sidebar
2. Upload modal appears as overlay
3. User drags PDF or clicks to browse
4. File is validated (PDF, <5MB)
5. User clicks "Upload Resume" button
6. File uploads to backend `/v1/resume/inject`
7. Success message displays
8. Modal auto-closes after 2 seconds
9. Resume is now searchable

### Mobile
1. User opens hamburger menu
2. Clicks "Upload Resume" button
3. Menu closes, upload modal opens
4. Same flow as desktop

## API Integration

**Endpoint**: `POST http://localhost:3000/v1/resume/inject`

**Request**: 
- Content-Type: `multipart/form-data`
- Field name: `resume`
- File type: PDF

**Response**:
- Success: Resume parsed and stored in MongoDB
- Vector embeddings generated
- Resume immediately searchable

## Technical Stack
- **React**: Component framework
- **Framer Motion**: Modal animations and transitions
- **Zustand**: State management (UI store)
- **Axios**: HTTP client for file upload
- **React Hot Toast**: Notification system
- **Lucide React**: Icons

## File Structure
```
src/
├── components/
│   ├── common/
│   │   └── MenuButton.tsx (updated)
│   ├── layout/
│   │   ├── Sidebar.tsx (updated - added upload button)
│   │   └── MobileDrawer.tsx (updated - added upload button)
│   └── upload/
│       └── UploadModal.tsx (new - complete modal component)
├── lib/
│   └── stores/
│       └── ui.store.ts (updated - added upload modal state)
└── pages/
    └── SearchPage.tsx (updated - added UploadModal)
```

## Testing Checklist
- [ ] Desktop: Click "Upload Resume" in sidebar
- [ ] Mobile: Open menu, click "Upload Resume"
- [ ] Drag & drop PDF file into modal
- [ ] Click to browse and select PDF
- [ ] Try uploading non-PDF file (should show error)
- [ ] Try uploading file >5MB (should show error)
- [ ] Upload valid PDF (should succeed)
- [ ] Verify success message appears
- [ ] Verify modal auto-closes
- [ ] Search for content from uploaded resume
- [ ] Test ESC key to close modal
- [ ] Test click outside to close modal

## Notes
- Upload modal uses same pattern as CandidateModal (consistent UX)
- Backend must be running on `http://localhost:3000`
- Uploaded files stored in `uploads/` directory
- Resume data stored in MongoDB `resumes` collection
- Vector embeddings enable semantic search
