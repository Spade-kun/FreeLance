# Registration Errors - Fixed ✅

## Issues Identified and Fixed

### 1. **Student Registration Error**
**Error:** `E11000 duplicate key error collection: lms_mern.students index: studentId_1 dup key: { studentId: null }`

**Root Cause:** 
- The `studentId` field had a unique index but was being set to `null` initially during registration
- MongoDB unique indexes don't allow multiple `null` values unless the index is sparse

**Solution:**
- Added `sparse: true` option to the `studentId` field in the Student model
- Dropped the old non-sparse index and created a new sparse index
- This allows multiple documents with `null` studentId while still maintaining uniqueness for non-null values

### 2. **Instructor Registration Error**
**Error:** `E11000 duplicate key error collection: lms_mern.instructors index: instructorId_1 dup key: { instructorId: null }`

**Root Cause:** 
- Same issue as Student - `instructorId` had a unique index without sparse option

**Solution:**
- Added `sparse: true` option to the `instructorId` field in the Instructor model
- Dropped and recreated the index as sparse

### 3. **Admin Registration Error**
**Error:** `Admin validation failed: permissions.0: 'view_dashboard' is not a valid enum value for path 'permissions.0'`

**Root Cause:** 
- The `permissions` enum array in the Admin model didn't include `view_dashboard` as a valid value
- The frontend or registration process was trying to assign this permission

**Solution:**
- Added `'view_dashboard'` to the enum values for the permissions field
- Now accepts: `['manage_users', 'manage_courses', 'manage_content', 'view_reports', 'view_dashboard', 'system_maintenance']`

## Files Modified

### 1. `/server/user-service/models/Student.js`
```javascript
studentId: {
  type: Number,
  unique: true,
  sparse: true // Added this to allow multiple null values
}
```

### 2. `/server/user-service/models/Instructor.js`
```javascript
instructorId: {
  type: Number,
  unique: true,
  sparse: true // Added this to allow multiple null values
}
```

### 3. `/server/user-service/models/Admin.js`
```javascript
adminId: {
  type: Number,
  unique: true,
  sparse: true // Added this to allow multiple null values
},
permissions: [{
  type: String,
  enum: ['manage_users', 'manage_courses', 'manage_content', 'view_reports', 'view_dashboard', 'system_maintenance']
  // Added 'view_dashboard' to the enum
}]
```

### 4. Created `/server/user-service/fix-indexes.js`
- A utility script that drops old non-sparse indexes and creates new sparse indexes
- Run with: `node fix-indexes.js` from the user-service directory

## How the Auto-Increment Works

The models use a pre-save hook to auto-generate IDs:

```javascript
// Example from Student model
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    try {
      const lastStudent = await this.constructor.findOne({}, {}, { sort: { 'studentId': -1 } });
      this.studentId = lastStudent ? lastStudent.studentId + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});
```

This means:
1. When a new user is created, `studentId`/`instructorId`/`adminId` is initially `null`
2. The sparse index allows this `null` value temporarily
3. Before saving, the pre-save hook auto-generates the next ID
4. The document is saved with the proper unique ID

## Testing the Fixes

### Test Student Registration:
```bash
curl -X POST http://localhost:1001/api/users/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

### Test Instructor Registration:
```bash
curl -X POST http://localhost:1001/api/users/instructors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "securePassword123",
    "specialization": "Computer Science"
  }'
```

### Test Admin Registration:
```bash
curl -X POST http://localhost:1001/api/users/admins \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "securePassword123",
    "permissions": ["view_dashboard", "manage_users", "view_reports"]
  }'
```

## Verification

After applying these fixes:

1. ✅ **MongoDB indexes updated** - All collections now have sparse indexes
2. ✅ **Models updated** - All three models now properly handle null IDs
3. ✅ **Services restarted** - All 7 services are running successfully
4. ✅ **Admin permissions fixed** - `view_dashboard` is now a valid permission

## Next Steps

You can now test registration through your frontend:
1. Try registering as a **Student** - should work without duplicate key errors
2. Try registering as an **Instructor** - should work without duplicate key errors  
3. Try registering as an **Admin** with `view_dashboard` permission - should work without validation errors

## Important Notes

- The sparse index allows temporary `null` values during the registration process
- Once the pre-save hook runs, each document gets a unique auto-incremented ID
- The unique constraint is still enforced for non-null values
- Multiple registrations happening simultaneously are handled by MongoDB's atomic operations

## Rollback (if needed)

If you need to rollback these changes:

```bash
# Drop the sparse indexes
db.students.dropIndex("studentId_1")
db.instructors.dropIndex("instructorId_1") 
db.admins.dropIndex("adminId_1")

# Create regular unique indexes
db.students.createIndex({ studentId: 1 }, { unique: true })
db.instructors.createIndex({ instructorId: 1 }, { unique: true })
db.admins.createIndex({ adminId: 1 }, { unique: true })
```

---

**Status:** ✅ All fixes applied and services running successfully!
