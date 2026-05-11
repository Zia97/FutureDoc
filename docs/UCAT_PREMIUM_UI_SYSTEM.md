# UCAT Premium UI System

Use this document when changing the Expo React Native UCAT prep app UI, especially the home screen and practice flow.

## Goal

Create a dark premium medical-tech interface for UCAT preparation. The UI should feel polished, focused, clinical, and production-ready, not like a basic dark theme.

Do not copy reference screenshots as image backgrounds. Recreate the interface with React Native components, gradients, SVG/vector elements, and reusable components.

## Core Screens

- Home: `src/screens/home/HomeScreen.js`
- Practice mode selection: `src/screens/practice/PracticeModeScreen.js`
- Normal Practice section selection: `src/screens/practice/PracticeSectionsScreen.js`
- Timed Practice section selection: `src/screens/practice/TimedPracticeSectionsScreen.js`
- Shared premium UI: `src/components/premium/PremiumPracticeUI.js`
- Shared SVG icons: `src/components/premium/PremiumIcon.js`
- Premium tokens: `src/theme/premiumTheme.js`
- Navigation routes: `src/navigation/AppNavigator.js`

Keep existing route names and behavior unless the user explicitly asks for navigation changes.

## Visual Language

- Background: deep navy to near-black gradient.
- Surface: glassy dark navy cards, soft borders, rounded corners.
- Primary accent: electric blue/cyan.
- Secondary accents:
  - Normal Practice: cyan/blue
  - Timed Practice: pink/red
  - Verbal Reasoning: blue
  - Decision Making: teal/cyan
  - Quantitative Reasoning: violet/purple
  - Situational Judgement: aqua/mint
- Text primary: near-white.
- Text secondary: muted blue-gray.
- Use subtle medical/science patterning: ECG lines, brain/network shapes, plus symbols, hexagons, circular arcs.
- Keep background pattern opacity low so content remains readable.

## Component Rules

Prefer reusable components already in `src/components/premium/PremiumPracticeUI.js`:

- `PremiumScreen`
- `PremiumScrollView`
- `AppHeader`
- `RichIconBox`
- `GlassMenuCard`
- `PracticeModeCard`
- `SectionSelectionCard`
- `MedicalBackgroundPattern`
- `PremiumFooter`

Use `PremiumIcon` from `src/components/premium/PremiumIcon.js` for icons. Avoid reintroducing `@expo/vector-icons` unless the package is installed and explicitly needed.

Use `StyleSheet.create` for styles. Keep layout responsive with flex, min/max widths, padding, and scroll views. Avoid hardcoded absolute positioning except for decorative SVG/background art.

## Card Design

Cards should have:

- Large rounded dark glass panel.
- Thin accent stripe on the left.
- Soft border using the card accent only where appropriate.
- Rich icon box on the left.
- Bold title.
- Muted description.
- Consistent chevron treatment on the right.
- Optional subtle bottom glow.

Important Android note:

- Avoid Android `elevation` for colored card/icon glows. It can render as blocky rectangular shadows behind rounded cards.
- Do not tint the whole left side of a card with a rectangular accent wash.
- If glow is needed, use a separate rounded gradient element under the card, not card-level elevation or a rectangular overlay.

## Home Screen Reference

The home screen should resemble the premium dark design:

- Header with the shared app logo, "UCAT Genius", "PREP SMARTER", theme button, and circular avatar.
- Hero card with greeting, "Focus today. Excel tomorrow.", supportive subtitle, streak pill, and continue-progress panel.
- Medical/doctor illustration should be vector/SVG or component-based, not pasted as a screenshot.
- Main menu cards:
  - Start Practising
  - Performance Analytics
  - About the UCAT
- Footer:
  - "Consistent practice. Confident mindset. Clinical future."
  - "You've got this."

## Practice Mode Screen

After tapping Start Practising, show:

- Custom dark premium header with back arrow, title "Practice", circular avatar with A/user initial.
- Heading: "How do you want to practise?"
- Subtitle: "Choose a practice mode that fits your goals."
- Two stacked cards:
  - Normal Practice
    - Description: "Browse and attempt questions at your own pace."
    - Accent: cyan/blue
    - Icon: pencil/target-style
    - Route: `PracticeSections`
  - Timed Practice
    - Description: "Sit timed tests under real UCAT conditions."
    - Accent: pink/red
    - Icon: timer
    - Preserve anonymous account gate before route `TimedPracticeSections`

## Normal Practice Section Screen

After tapping Normal Practice, show:

- Header title: "Normal Practice"
- Heading: "Select Section"
- Subtitle: "Choose a UCAT section to practise"
- Four stacked cards:
  - Verbal Reasoning
    - Description: "Reading comprehension and critical analysis"
    - Accent: blue
    - Route: `VRQuestionList`
  - Decision Making
    - Description: "Logic puzzles, arguments and diagrams"
    - Accent: teal/cyan
    - Route: `DMQuestionList`
  - Quantitative Reasoning
    - Description: "Numerical problem solving and data interpretation"
    - Accent: violet/purple
    - Route: `QRQuestionList`
  - Situational Judgement
    - Description: "Professional scenarios and ethical judgement"
    - Accent: aqua/mint
    - Route: `SJScenarioList`

## Dependencies

Installed and suitable:

- `expo-linear-gradient`
- `react-native-svg`

Avoid adding dependencies unless they clearly improve maintainability and are approved by the user.

## Quality Bar

Before finishing UI changes:

- Check that text does not overlap on narrow screens.
- Keep card dimensions and spacing consistent.
- Preserve accessible contrast.
- Verify touched files parse or run available checks.
- Mention if TypeScript/lint/tests are unavailable or blocked by unrelated project configuration.
- Summarize exactly which files changed.
