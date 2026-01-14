# Auth Flow Manual Test Checklist

## Test Environment Setup
- ✅ Development server running on http://localhost:8081
- ✅ All tests passing (68/68)
- ✅ No critical linting errors

## 🧪 **Manual Test Cases**

### 1. **Button Validation Tests**

#### Test 1.1: Button Initially Disabled
- [ ] Open signup page
- [ ] **Expected**: "Create account" button should be disabled
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 1.2: Button Enables After Complete Form
- [ ] Fill Name: "John Doe" 
- [ ] Fill Email: "john@example.com"
- [ ] Fill Password: "SecurePass123!"
- [ ] Fill Confirm Password: "SecurePass123!"
- [ ] Check "Accept Terms"
- [ ] Check "Accept Privacy"
- [ ] **Expected**: Button should now be enabled
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 1.3: Button Disables on Invalid Input
- [ ] Clear email field or enter invalid email
- [ ] **Expected**: Button should disable again
- [ ] **Status**: ❌ FAIL / ✅ PASS

### 2. **Role Selector Mobile Behavior Tests**

#### Test 2.1: Role Selection Visual Feedback
- [ ] Tap on "Individual User" role card
- [ ] **Expected**: Card should highlight with blue border and checkmark
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 2.2: Role Selection Form Update
- [ ] Select "Team Manager" role
- [ ] **Expected**: Organization field should change to "Organization Name"
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 2.3: Touch Responsiveness
- [ ] Tap quickly between different role options
- [ ] **Expected**: Smooth transitions, no lag, proper visual feedback
- [ ] **Status**: ❌ FAIL / ✅ PASS

### 3. **Input Animation Tests**

#### Test 3.1: Focus State
- [ ] Tap on email input field
- [ ] **Expected**: Clean border highlight (no excessive animations)
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 3.2: Error State
- [ ] Enter invalid email and tap elsewhere
- [ ] **Expected**: Red border, error message below field
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 3.3: Success State
- [ ] Enter valid email
- [ ] **Expected**: Normal border, no excessive success animations
- [ ] **Status**: ❌ FAIL / ✅ PASS

### 4. **Organization ID Flow Tests**

#### Test 4.1: Guest Role - No Organization
- [ ] Select "Guest" role
- [ ] **Expected**: No organization field shown
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 4.2: User Role - Optional Code
- [ ] Select "Individual User" role
- [ ] **Expected**: "Organization Code (Optional)" field appears
- [ ] Enter: "ACME2024"
- [ ] **Expected**: Text auto-converts to uppercase
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 4.3: Manager Role - Organization Creation
- [ ] Select "Team Manager" role
- [ ] **Expected**: "Organization Name" field appears
- [ ] **Expected**: Info box shows "Creating New Organization"
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 4.4: Form Validation with Organization
- [ ] Select "Manager", enter org name "Test Corp"
- [ ] Fill all other required fields
- [ ] **Expected**: Button should enable
- [ ] **Status**: ❌ FAIL / ✅ PASS

### 5. **Cross-Platform Component Tests**

#### Test 5.1: Checkbox Functionality
- [ ] Click/tap terms checkbox
- [ ] Click/tap privacy checkbox  
- [ ] **Expected**: Visual checkmarks appear, form validation updates
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 5.2: Role Selector Platform Behavior
- [ ] **Web**: Should use DOM-based buttons
- [ ] **Mobile**: Should use TouchableOpacity with proper feedback
- [ ] **Status**: ❌ FAIL / ✅ PASS

### 6. **Form Submission Tests**

#### Test 6.1: Successful Submission
- [ ] Complete valid form
- [ ] Click "Create account"
- [ ] **Expected**: Loading state shows, success message appears
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 6.2: Validation Prevention
- [ ] Try submitting incomplete form
- [ ] **Expected**: Button stays disabled, no submission occurs
- [ ] **Status**: ❌ FAIL / ✅ PASS

### 7. **Performance Tests**

#### Test 7.1: Role Switching Performance
- [ ] Rapidly switch between roles
- [ ] **Expected**: Smooth transitions, no lag
- [ ] **Status**: ❌ FAIL / ✅ PASS

#### Test 7.2: Form Validation Performance
- [ ] Type quickly in various fields
- [ ] **Expected**: Real-time validation without blocking UI
- [ ] **Status**: ❌ FAIL / ✅ PASS

## 📊 **Test Results Summary**

### Critical Issues (Must Fix)
- [ ] Issue 1: _________________________________
- [ ] Issue 2: _________________________________
- [ ] Issue 3: _________________________________

### Minor Issues (Nice to Fix)
- [ ] Issue 1: _________________________________
- [ ] Issue 2: _________________________________

### Passed Tests
- [ ] Button validation: ___/4 tests passed
- [ ] Role selector: ___/3 tests passed  
- [ ] Input behavior: ___/3 tests passed
- [ ] Organization flow: ___/4 tests passed
- [ ] Cross-platform: ___/2 tests passed
- [ ] Form submission: ___/2 tests passed
- [ ] Performance: ___/2 tests passed

**Total Score: ___/20 tests passed**

## 🎯 **Success Criteria**
- ✅ **95%+ Pass Rate** (19+ tests passing)
- ✅ **All Critical Features Working**: Button validation, role selection, organization flow
- ✅ **No Performance Issues**: Smooth interactions, responsive UI
- ✅ **Cross-Platform Compatibility**: Works on both web and mobile

## 🐛 **Known Issues to Verify Fixed**
1. ✅ Button not enabling after entering details ➜ **FIXED**
2. ✅ Mobile RoleSelector not behaving properly ➜ **FIXED** 
3. ✅ Input animations not standard ➜ **FIXED**
4. ✅ Shadcn components mobile compatibility ➜ **FIXED**

---

**Test Conducted By**: _________________  
**Date**: _________________  
**Environment**: Web / iOS / Android  
**Overall Status**: ❌ FAIL / ⚠️ PARTIAL / ✅ PASS