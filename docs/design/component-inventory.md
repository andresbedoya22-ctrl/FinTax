# FinTax Component Inventory (UI Surfaces)

## Public / Landing Components
- `src/components/fintax/landing/PremiumLandingPage.tsx`
- `src/components/fintax/landing/HeroSection.tsx`
- `src/components/fintax/landing/HowItWorksSection.tsx`
- `src/components/fintax/landing/PricingSection.tsx`
- `src/components/fintax/landing/ServicesSection.tsx`
- `src/components/fintax/landing/FaqSection.tsx`
- `src/components/fintax/landing/TestimonialsSection.tsx`
- `src/components/fintax/landing/WhyFinTaxSection.tsx`

## Auth + Onboarding Components
- `src/components/fintax/auth/AuthScreen.tsx`
- `src/components/fintax/auth/OnboardingScreen.tsx`

## Dashboard Components
- `src/components/fintax/dashboard/DashboardShell.tsx`
- `src/components/fintax/dashboard/DashboardSidebar.tsx`
- `src/components/fintax/dashboard/DashboardTopbar.tsx`
- `src/components/fintax/dashboard/DashboardOverview.tsx`
- `src/components/fintax/dashboard/DashboardNotifications.tsx`

## Flow Components (Authenticated Workflows)
- `src/components/fintax/flows/TaxReturnFlow.tsx`
- `src/components/fintax/flows/BenefitsFlow.tsx`
- `src/components/fintax/flows/CaseDetailView.tsx`
- `src/components/fintax/flows/SettingsScreen.tsx`
- `src/components/fintax/flows/AdminScreen.tsx`
- `src/components/fintax/flows/StripeSuccessScreen.tsx`

## Shared App Components
- `src/components/fintax/Navbar.tsx`
- `src/components/fintax/Footer.tsx`
- `src/components/fintax/LanguageSwitcher.tsx`
- `src/components/fintax/loading/RouteSkeletons.tsx`
- `src/components/fintax/motion/AuthenticatedRouteTransition.tsx`

## Base UI Primitives (`src/components/ui`)
- `accordion.tsx`
- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `dialog.tsx`
- `empty-state.tsx`
- `input.tsx`
- `Pictogram.tsx`
- `select.tsx`
- `skeleton.tsx`
- `stepper.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toast.tsx`

## Stepper-Critical Touchpoints
- `src/components/ui/stepper.tsx`
- `src/components/fintax/dashboard/DashboardOverview.tsx`
- `src/components/fintax/flows/CaseDetailView.tsx`
- `src/components/fintax/flows/TaxReturnFlow.tsx`
- `src/components/fintax/flows/BenefitsFlow.tsx`
- `src/components/fintax/auth/OnboardingScreen.tsx`
- `src/domain/cases/status-stepper.ts`

## Candidate Route Files by Surface
Landing:
- `src/app/[locale]/page.tsx`

Auth:
- `src/app/[locale]/auth/page.tsx`
- `src/app/[locale]/auth/callback/route.ts`
- `src/app/[locale]/onboarding/page.tsx`

Dashboard:
- `src/app/[locale]/dashboard/layout.tsx`
- `src/app/[locale]/dashboard/page.tsx`
- `src/app/[locale]/tax-return/page.tsx`
- `src/app/[locale]/tax-return/[caseId]/page.tsx`
- `src/app/[locale]/benefits/page.tsx`
- `src/app/[locale]/benefits/[caseId]/page.tsx`
- `src/app/[locale]/settings/page.tsx`
- `src/app/[locale]/admin/page.tsx`
