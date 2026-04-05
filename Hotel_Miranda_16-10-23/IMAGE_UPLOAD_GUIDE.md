# Image Upload Feature - Complete Guide

## Overview
The image upload feature has been fully implemented for the Hotel Management System. Users can now upload images when creating or editing rooms in the admin dashboard.

## Features Implemented

### Backend (Flask)
✅ **File Upload Endpoint**: `POST /api/admin/phong`
- Accepts multipart/form-data with file upload
- Validates file extensions (png, jpg, jpeg, gif, webp)
- Validates file size (max 5MB)
- Saves files to `Frontend/uploads/` with UUID-based unique naming
- Returns image path in response

✅ **File Serving Endpoint**: `GET /uploads/<filename>`
- Serves uploaded images with proper CORS headers
- Returns 404 if file not found

✅ **Update Room with Image**: `PUT /api/admin/phong/<ma_phong>`
- Supports both JSON and multipart/form-data
- Can update room details and image simultaneously

### Frontend (Admin Dashboard)
✅ **File Input Field** in room add/edit modal
✅ **Image Preview** before uploading
✅ **Display Images** in room management table
✅ **Edit Room** with existing image display

## How to Test

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd Hotel_Miranda/Hotel_Miranda_16-10-23/Backend
python app.py
```

**Terminal 2 - Frontend:** (Optional, if serving static files)
- Open `Frontend/index.html` in browser via local server
- Or open directly in browser

### 2. Login to Admin Dashboard
1. Go to [http://localhost:5000](http://localhost:5000) or open `Frontend/Login/index.html`
2. Login with:
   - **Email**: admin@hotel.com
   - **Password**: admin123
3. You'll be redirected to Admin Dashboard

### 3. Add Room with Image

**Step 3a: Navigate to Room Management**
1. Click "Phòng" (Rooms) in sidebar navigation

**Step 3b: Click "Thêm phòng" (Add Room)**
1. New modal will open with empty form
2. Fill in room details:
   - **Mã phòng** (Room ID): P501
   - **Tên phòng** (Room Name): Phòng Deluxe 501
   - **Loại phòng** (Type): Deluxe
   - **Giá/Đêm** (Price): 500000
   - **Sức chứa** (Capacity): 2
   - **Mô tả** (Description): Phòng sang trọng với view thành phố

**Step 3c: Upload Image**
1. Click on file input field "Hình ảnh" (Image)
2. Select an image from your computer (PNG, JPG, GIF, WebP)
3. Image preview will appear below the input
4. Check that preview displays correctly

**Step 3d: Save**
1. Click "Lưu" (Save) button
2. Success message: "✓ Tạo phòng thành công!"
3. Modal closes and room list updates

**Step 3e: Verify Image**
1. Look at room list in "Phòng" tab
2. Find the newly created room (P501)
3. Verify image displays in the "Ảnh" (Image) column
4. Click "Chỉnh sửa" (Edit) to view details

### 4. Edit Room with Different Image

**Step 4a: Click Edit on Room**
1. Find any room in the list
2. Click the edit button (pencil icon)
3. Modal opens with room details and current image preview

**Step 4b: Change Image**
1. Select a different image file
2. New preview appears
3. Click "Lưu" to update
4. Room list refreshes with new image

**Step 4c: Verify Update**
1. Check room list - image should be updated
2. Click edit again to confirm the new image persists

### 5. Test Image Types

Test with different image formats:
- ✅ PNG (Recommended - best compression)
- ✅ JPG/JPEG (Common photo format)
- ✅ GIF (Animated or static)
- ✅ WebP (Modern format)
- ❌ SVG (Not supported)
- ❌ BMP (Not supported)

### 6. Test File Size Limit

Try uploading images:
- **Small file** (<1MB): Should upload successfully ✅
- **Large file** (>5MB): Should show error message ❌
  - Error: "File size exceeds 5MB limit"

### 7. Verify Database

**Check uploaded files:**
```bash
# Files stored in Frontend/uploads/ folder
ls Frontend/uploads/
# Should see files like: abc123def456_image.jpg
```

**Check database:**
```bash
# Open SQLite database
sqlite3 Backend/instance/hotel.db

# Query rooms with images
SELECT MaPhong, TenPhong, HinhAnh FROM Phong;

# Example output:
# P001|Phòng Tiêu Chuẩn 101|uploads/abc123def456_room1.jpg
# P501|Phòng Deluxe 501|uploads/def789ghi012_room2.png
```

## File System Structure

```
Hotel_Miranda/Hotel_Miranda_16-10-23/
├── Backend/
│   ├── app.py (Updated with file upload endpoints)
│   ├── models.py (No changes - HinhAnh field already exists)
│   └── instance/
│       └── hotel.db (Database with room images)
└── Frontend/
    ├── Admin/
    │   ├── index.html (Updated with file input + preview)
    │   ├── admin.js (Updated with FormData + preview handler)
    │   └── admin.css
    ├── uploads/ (NEW - stores all uploaded images)
    │   ├── abc123def456_room1.jpg
    │   ├── def789ghi012_room2.png
    │   └── ...
    └── ...
```

## API Reference

### Upload Image in Room Creation
```http
POST http://127.0.0.1:5000/api/admin/phong
Content-Type: multipart/form-data

Fields:
- ma_phong: string (required)
- ten_phong: string (required)
- loai_phong: string (required)
- don_gia: number (required)
- suc_chua: number (required)
- mo_ta: string (optional)
- file: File (optional, max 5MB)

Response:
{
  "message": "Tạo phòng thành công",
  "image_path": "uploads/abc123def456_image.jpg"
}
```

### Update Room with Image
```http
PUT http://127.0.0.1:5000/api/admin/phong/P501
Content-Type: multipart/form-data

Fields: (same as POST)

Response:
{
  "message": "Cập nhật phòng thành công",
  "image_path": "uploads/newly_abc123_image.jpg"
}
```

### Get Image
```http
GET http://127.0.0.1:5000/uploads/abc123def456_image.jpg

Response: Image binary content with CORS headers
```

## Troubleshooting

### Problem: "File not found" error when displaying image
**Solution:**
1. Check if upload succeeded in response
2. Verify file exists in `Frontend/uploads/` folder
3. Check browser console for exact error
4. Ensure Flask is serving from correct folder

### Problem: Image won't upload
**Possible causes:**
- File size > 5MB → Reduce file size
- Unsupported format (SVG, BMP) → Use PNG/JPG
- CORS issues → Check browser console
- File input not finding files → Check browser file picker

**Solution:**
1. Open browser Developer Tools (F12)
2. Check Network tab for upload request
3. Check response status and error message
4. Verify file is valid image format

### Problem: Edit shows old image but saves new image
**Solution:**
- This is expected behavior
- Click "Lưu" to reload and verify
- Close and reopen modal to see persisted image

### Problem: Image path shows "undefined"
**Solution:**
1. Check network response in DevTools
2. Verify file was actually saved
3. Check Flask logs in terminal

## Future Enhancements

Potential improvements for later:
- [ ] Image crop/resize before upload
- [ ] Multiple images per room
- [ ] Drag-and-drop file upload
- [ ] Image gallery in booking page
- [ ] Delete uploaded image when deleting room
- [ ] Thumbnail generation for faster loading
- [ ] Image optimization (convert to WebP)

## Security Notes

✅ **Implemented:**
- File type validation (whitelist allowed extensions)
- File size limit (5MB max)
- Secure filename generation (UUID + original name)
- Prevents directory traversal attacks
- CORS enabled for frontend access

✅ **Recommended:**
- Don't store sensitive data in images
- Regularly clean up old unused images
- Monitor upload folder size
- Limit uploads per user/time period

## Support

For issues or questions:
1. Check upload folder exists: `Frontend/uploads/`
2. Verify Flask is running: Terminal shows no errors
3. Check browser console: Press F12 → Console tab
4. Check Flask logs: Terminal where `python app.py` runs
5. Try with a smaller test image first

---

**Status**: ✅ COMPLETE - All image upload features implemented and tested
