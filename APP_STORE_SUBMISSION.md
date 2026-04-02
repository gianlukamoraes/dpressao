# dPressão - App Store Submission Guide

## Overview

This document provides guidance for submitting dPressão to the Apple App Store and Google Play Store.

## Requirements Checklist

### Phase 1: Features (✅ Complete)
- [x] Home screen with latest reading
- [x] History screen with filtering
- [x] Add/Edit/Delete readings
- [x] Settings with user profile
- [x] Reading details view

### Phase 2: Trends (✅ Complete)
- [x] Trends screen with period filters
- [x] Line chart visualization
- [x] Statistics (average, min, max)
- [x] Classification distribution

### Phase 3: Medical Compliance (✅ Complete)
- [x] Medical disclaimer (first access)
- [x] Privacy policy
- [x] About screen
- [x] Footer disclaimer on home
- [x] AHA/ACC 2017 compliance

### Phase 4: Data Export (✅ Complete)
- [x] PDF report generation
- [x] CSV export
- [x] JSON backup/restore
- [x] Import functionality

### Phase 5: Notifications (✅ Complete)
- [x] Daily reminder scheduling
- [x] Time selection
- [x] Permission handling
- [x] Notification toggle

### Phase 6: Polish & Build (✅ Complete)
- [x] Error boundary
- [x] App icons
- [x] Splash screen
- [x] EAS configuration
- [x] App.json metadata

## App Store Metadata

### App Name
**English:** dPressão
**Portuguese:** dPressão - Monitoramento de Pressão Arterial

### Subtitle
**Maximum 30 characters**
"Monitor your blood pressure"

### Description

**English (~300 words):**
dPressão is a simple and secure blood pressure monitoring application designed to help you track your health independently. All data is stored locally on your device with complete privacy.

**Key Features:**
- Record blood pressure readings with ease (systolic, diastolic, pulse)
- View trends with interactive charts and period filters
- Detailed statistics and classification analysis
- Daily reminders to check your blood pressure
- Export data as PDF, CSV, or JSON backup
- Complete privacy - no data sharing or cloud sync
- Based on AHA/ACC 2017 medical guidelines

**Important:**
This app is for personal health tracking only and does not replace professional medical advice. In case of hypertensive crisis (≥180/120 mmHg with symptoms), seek emergency medical care immediately.

All your health data stays on your device. We don't collect, store, or share any personal information. Full compliance with LGPD and GDPR.

### Keywords (10 max per store)
- blood pressure
- health monitoring
- bp tracker
- hypertension
- wellness
- fitness
- health app
- heart health
- medical
- saúde (for Portuguese)

### Category
**Primary:** Health & Fitness
**Secondary:** Medical (if available)

### Support URL
https://github.com/gianlukamoraes/dpressao

### Privacy Policy URL
[Include full privacy policy URL - currently in-app only]

### Screenshots

#### iPhone Screenshots (Required: 2-5 per App Store)

**Screenshot 1: Home Screen**
- Show: Latest reading card, quick action button, reference table
- Caption: "Track your latest blood pressure reading with color-coded classifications"

**Screenshot 2: Trends Screen**
- Show: Chart, statistics, distribution
- Caption: "Visualize your blood pressure trends over time"

**Screenshot 3: History Screen**
- Show: Filtered readings, export buttons
- Caption: "Complete history with export capabilities (PDF, CSV, JSON)"

**Screenshot 4: Settings**
- Show: User profile, reminders, privacy policy
- Caption: "Configure reminders and manage your settings"

#### iPad Screenshots (Optional)
- Larger format showing split layout if supported

#### Android Screenshots (Google Play)
- 2-5 screenshots (landscape or portrait)
- Similar content to iPhone with Android-specific UI

### Release Notes
```
Version 1.0.0 - Initial Release

Features:
✓ Blood pressure tracking with classification
✓ Interactive trend charts
✓ Daily reminders
✓ Data export (PDF, CSV, JSON)
✓ Complete privacy - local storage only
✓ LGPD and GDPR compliant
✓ Based on AHA/ACC 2017 guidelines

Medical Compliance:
✓ Emergency hypertensive crisis warnings
✓ Comprehensive disclaimer
✓ Privacy policy included
✓ Medical accuracy verified

Bug Fixes & Improvements:
✓ Performance optimizations
✓ UI/UX refinements
✓ Error boundary for stability
```

## Submission Steps

### Prerequisites
1. Apple Developer Account ($99/year)
2. Google Play Developer Account ($25 one-time)
3. EAS account (free, linked to Expo)
4. Code signing certificates (iOS)
5. Screenshots in correct dimensions
6. App Store artwork (icon, banner)

### iOS Submission (App Store)

#### 1. Prepare Build
```bash
npx eas build --platform ios --auto-submit
```

#### 2. Create App in App Store Connect
- Go to appstoreconnect.apple.com
- Create new app with bundle identifier: `com.gianlukamoraes.dpressao`
- Fill in required metadata
- Upload screenshots

#### 3. Build & Submission
- Use EAS CLI with `--auto-submit` flag
- Or manually upload build to App Store Connect
- Submit for review

#### 4. App Review
- Apple review takes 1-2 business days
- Common rejection reasons:
  - Vague/misleading screenshots
  - Health claims without evidence
  - No clear medical disclaimer
  - Privacy policy issues
  - Stability issues

**Tips to Avoid Rejection:**
- Be clear this is personal tracking, not medical diagnosis
- Include emergency warnings prominently
- Ensure all links work (privacy policy, etc.)
- Test thoroughly on multiple devices
- Include medical guidelines reference

### Android Submission (Google Play)

#### 1. Prepare Build
```bash
npx eas build --platform android --auto-submit
```

#### 2. Create App in Google Play Console
- Go to play.google.com/console
- Create new app with package name: `com.gianlukamoraes.dpressao`
- Fill in store listing metadata
- Upload screenshots and banner

#### 3. Set Up Store Listing
- Category: Health & Fitness or Medical
- Content rating: Fill out questionnaire
- Privacy policy: Include link
- Permissions: Explain usage

#### 4. Build & Release
- Use EAS CLI for automatic submission
- Or manually upload APK/AAB to Play Console
- Start with "Internal Testing" release
- Move to "Staging" release for beta testers
- Promote to "Production" for public release

**Review Timeline:**
- Internal/Staging: Instant
- Production: 1-3 hours (usually faster)

### Key Compliance Points

#### 1. Medical Disclaimer
✓ Clearly visible in app
✓ First-access acceptance required
✓ Accessible from settings
✓ Mentions AHA/ACC 2017 standards
✓ Emergency hypertensive crisis warning

#### 2. Privacy Policy
✓ Publicly accessible URL
✓ Covers data storage (local only)
✓ Lists permissions requested
✓ LGPD/GDPR compliance statement
✓ No third-party integrations mentioned

#### 3. Health & Fitness Category Guidelines
✓ Not claiming to diagnose or treat disease
✓ Recommending consultation with healthcare providers
✓ Maintaining user data privacy
✓ Accurate medical information
✓ Emergency instructions included

#### 4. Permissions
✓ Notifications: Optional reminder feature
✓ File access: For data import/export
✓ Camera/Microphone: Not used
✓ Location: Not used
✓ Health Kit: Not currently integrated

## Testing Before Submission

### Device Testing
```bash
# iOS on physical device
npx eas build -p ios --profile preview
# Install and test on iPhone/iPad

# Android on physical device
npx eas build -p android --profile preview
# Install and test on Android phone/tablet
```

### Test Scenarios
- [ ] First launch - disclaimer appears
- [ ] Add reading - all fields work
- [ ] Edit reading - changes persist
- [ ] Delete reading - confirmation works
- [ ] Export PDF - opens correctly
- [ ] Export CSV - can import again
- [ ] Trends screen - loads without crash
- [ ] Reminders - notification fires daily
- [ ] Settings - all controls functional
- [ ] Error boundary - handles crashes gracefully

### Performance Checklist
- [ ] App launches in < 3 seconds
- [ ] Charts render smoothly
- [ ] No memory leaks during extended use
- [ ] Battery usage reasonable
- [ ] Network: Works offline entirely
- [ ] Storage: No unnecessary files

## Version Updates

### Update Strategy
- **Critical bug fixes:** Emergency submit
- **Feature additions:** Quarterly or as needed
- **Minor improvements:** Batch with features

### Example v1.1.0 Updates
- HealthKit integration (iOS) / Google Fit (Android)
- Dark mode refinement
- Medication tracking
- Multiple user profiles
- Biometric authentication

## Common Issues & Solutions

### Issue: App Rejected for Medical Content
**Solution:** Emphasize personal tracking, not diagnosis. Include all disclaimers and emergency warnings.

### Issue: Privacy Policy Link Broken
**Solution:** Host on GitHub Pages or website. Test link before submission.

### Issue: Screenshots Too Blurry
**Solution:** Use simulator with high DPI, export at correct resolution (1242×2208 for iPhone, 1440×2560 for Android).

### Issue: Crashes on Startup
**Solution:** Test on physical device. Check error boundary logs. Ensure all dependencies installed.

### Issue: Notification Permissions Denied
**Solution:** Request permissions explicitly. Handle denial gracefully. Show explanation for why reminders are useful.

## Post-Launch Support

### Monitoring
- Track crash reports via EAS
- Monitor app store reviews
- Set up issue tracking on GitHub
- Respond to user feedback

### Bug Fixes
- Test locally first
- Submit bug fix releases quickly
- Use version numbering: 1.0.1, 1.0.2, etc.

### Feature Development
- Plan roadmap based on user feedback
- Keep health/compliance focus
- Avoid feature creep
- Maintain privacy first principles

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [AHA/ACC Blood Pressure Guidelines](https://www.heart.org/en/get-involved/advocate/federal-priorities/prevention-of-heart-disease-and-stroke)
- [LGPD Information](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [GDPR Information](https://gdpr-info.eu/)
