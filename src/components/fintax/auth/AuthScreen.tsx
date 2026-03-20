"use client";
/* eslint-disable @next/next/no-img-element */

import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
import {
  AlertTriangle,
  Apple,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import zxcvbn from "zxcvbn";

import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  buttonVariants,
} from "@/components/ui";
import { useEncryptedFormDraft } from "@/hooks/useEncryptedFormDraft";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register" | "forgot";
type AppLocale = "en" | "es" | "pl" | "ro" | "nl";
type AuthIntent = "tax-return" | "benefits";
type PendingAuthIntent = { intent: AuthIntent; service?: string; next: string };
type AuthScreenSearchParams = {
  intent?: string;
  service?: string;
  next?: string;
  reason?: string;
};

type LoginValues = { email: string; password: string };
type RegisterValues = {
  fullName: string;
  nationality: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};
type ForgotValues = { email: string };

type AuthExtraCopy = {
  title: string;
  registerHint: string;
  registerHintLink: string;
  loginSubtitle: string;
  registerSubtitle: string;
  forgotTitle: string;
  forgotSubtitle: string;
  forgotLink: string;
  forgotSubmit: string;
  forgotBack: string;
  resetInfo: string;
  checkEmailInfo: string;
  nationalityLabel: string;
  nationalityPlaceholder: string;
  hints: {
    fullName: string;
    nationality: string;
    email: string;
    password: string;
  };
  intent: {
    taxReturn: string;
    benefits: string;
    selectedService: string;
    noService: string;
    registerDefault: string;
  };
  trust: {
    eyebrow: string;
    body: string;
    points: string[];
    methods: string;
    digid: string;
    noteTitle: string;
    noteBody: string;
  };
  passwordStrength: {
    label: string;
    weak: string;
    fair: string;
    good: string;
    strong: string;
  };
  mfa: {
    required: string;
    title: string;
    subtitle: string;
    loading: string;
    qrTitle: string;
    qrBody: string;
    codeLabel: string;
    codePlaceholder: string;
    verify: string;
    verifying: string;
    skip: string;
    continue: string;
    unavailable: string;
    ready: string;
    success: string;
    alreadyEnabled: string;
  };
};

type AuthUiCopy = {
  eyebrow: string;
  tabs: { login: string; register: string };
  social: { google: string; apple: string; emailDivider: string };
  form: {
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    submitLogin: string;
    submitRegister: string;
    termsLabel: string;
    termsLink: string;
    backToLanding: string;
    continueAccount: string;
  };
  a11y: {
    showPassword: string;
    hidePassword: string;
    showConfirmPassword: string;
    hideConfirmPassword: string;
  };
  validation: {
    fullName: string;
    nationality: string;
    invalidEmail: string;
    passwordLength: string;
    passwordMismatch: string;
    terms: string;
    code: string;
  };
  panel: {
    title: string;
    quote: string;
    quoteRole: string;
    note: string;
    caseLabel: string;
    caseTitle: string;
    caseCopy: string;
    verifyCopy: string;
    manualKey: string;
  };
};

const AUTH_INTENT_SESSION_KEY = "fintax.pending_intent";
const AUTH_MFA_AFTER_LOGIN_KEY = "fintax.auth.mfa_after_login";
const LOGIN_DRAFT_KEY = "fintax.auth.login-draft";
const REGISTER_DRAFT_KEY = "fintax.auth.register-draft";
const FORGOT_DRAFT_KEY = "fintax.auth.forgot-draft";

const extraCopy: Record<AppLocale, AuthExtraCopy> = {
  en: {
    title: "Welcome back",
    registerHint: "First time here?",
    registerHintLink: "Create your secure account",
    loginSubtitle: "Sign in to continue into your FinTax workspace, guided filing flow, and protected case updates.",
    registerSubtitle: "Create your account to start secure intake, guided onboarding, and protected access to Dutch tax and benefits workflows.",
    forgotTitle: "Reset your password",
    forgotSubtitle: "Enter the email for your account and we will send a secure password reset link.",
    forgotLink: "Forgot your password?",
    forgotSubmit: "Send reset link",
    forgotBack: "Back to sign in",
    resetInfo: "If this email exists, a password reset link has been sent.",
    checkEmailInfo: "Check your inbox to confirm the account. After email verification, sign in and complete two-step verification from the modal.",
    nationalityLabel: "Nationality",
    nationalityPlaceholder: "For example: Spanish, Polish, Romanian",
    hints: {
      fullName: "We use this to connect your account, case workspace, and later human review trail.",
      nationality: "Nationality can affect treaty questions, tax credits, and the guidance shown later inside the filing flow.",
      email: "This email is used for secure access, case notices, and password recovery.",
      password: "Use a unique password. Passwords are excluded from browser draft recovery.",
    },
    intent: {
      taxReturn: "Tax return intake requested",
      benefits: "Benefits intake requested",
      selectedService: "Selected service",
      noService: "A specific service is not selected yet. You can still create your account now and choose the exact flow after sign-in.",
      registerDefault: "We opened account creation by default so you can continue directly into the requested flow.",
    },
    trust: {
      eyebrow: "Secure account access",
      body: "This account area is designed to protect access, preserve case continuity, and prepare clients for a structured Dutch tax workflow.",
      points: [
        "Protected routes before case data becomes visible",
        "Guided intake for tax returns and benefits",
        "Human review and follow-up after authentication",
      ],
      methods: "Available access methods",
      digid: "DigiD is not available yet. Access currently runs through email, Google, and Apple when enabled.",
      noteTitle: "Operational note",
      noteBody: "No DigiD or eIDAS sign-in is promised here. Authentication currently runs through supported FinTax account methods only.",
    },
    passwordStrength: { label: "Password strength", weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" },
    mfa: {
      required: "Admin access requires MFA. Sign in and complete enrollment first.",
      title: "Set up two-step verification",
      subtitle: "Add a TOTP authenticator app before you continue into the secure workspace.",
      loading: "Preparing your authenticator setup...",
      qrTitle: "Scan the QR code in your authenticator app",
      qrBody: "After scanning, enter the 6-digit code generated by your app to verify the device.",
      codeLabel: "6-digit verification code",
      codePlaceholder: "123456",
      verify: "Verify code",
      verifying: "Verifying code...",
      skip: "Set up later",
      continue: "Continue to workspace",
      unavailable: "MFA enrollment is not available yet in this Supabase project. Enable project-level MFA to complete TOTP onboarding.",
      ready: "Authenticator ready. Verify one code to finish setup.",
      success: "Two-step verification is enabled for this account.",
      alreadyEnabled: "Two-step verification is already enabled on this account.",
    },
  },
  es: {
    title: "Bienvenido de nuevo",
    registerHint: "Primera vez aqui?",
    registerHintLink: "Crea tu cuenta segura",
    loginSubtitle: "Inicia sesion para continuar a tu espacio FinTax, el flujo guiado y el seguimiento protegido del caso.",
    registerSubtitle: "Crea tu cuenta para empezar con intake seguro, onboarding guiado y acceso protegido a impuestos y subsidios en NL.",
    forgotTitle: "Restablecer contrasena",
    forgotSubtitle: "Introduce el correo de tu cuenta y enviaremos un enlace seguro para restablecer la contrasena.",
    forgotLink: "Olvidaste tu contrasena?",
    forgotSubmit: "Enviar enlace",
    forgotBack: "Volver a iniciar sesion",
    resetInfo: "Si este correo existe, se ha enviado un enlace de recuperacion.",
    checkEmailInfo: "Revisa tu bandeja de entrada para verificar la cuenta. Despues inicia sesion y completa la verificacion en dos pasos desde el modal.",
    nationalityLabel: "Nacionalidad",
    nationalityPlaceholder: "Por ejemplo: espanola, polaca, rumana",
    hints: {
      fullName: "Lo usamos para conectar tu cuenta, el espacio del caso y la trazabilidad de la revision profesional.",
      nationality: "La nacionalidad puede influir en convenios, creditos fiscales y la guia mostrada despues dentro del flujo.",
      email: "Este correo se usa para acceso seguro, avisos del caso y recuperacion de contrasena.",
      password: "Usa una contrasena unica. Las contrasenas no se guardan en borradores del navegador.",
    },
    intent: {
      taxReturn: "Se solicito intake fiscal",
      benefits: "Se solicito intake de subsidios",
      selectedService: "Servicio seleccionado",
      noService: "Todavia no se ha elegido un servicio concreto. Puedes crear la cuenta ahora y seleccionar el flujo exacto despues.",
      registerDefault: "Abrimos por defecto la creacion de cuenta para que puedas continuar directo en el flujo solicitado.",
    },
    trust: {
      eyebrow: "Acceso seguro a la cuenta",
      body: "El area de cuenta esta pensada para proteger el acceso, mantener la continuidad del caso y preparar un flujo fiscal neerlandes estructurado.",
      points: [
        "Rutas protegidas antes de mostrar datos del caso",
        "Intake guiado para impuestos y subsidios",
        "Revision humana y seguimiento despues de autenticarte",
      ],
      methods: "Metodos de acceso disponibles",
      digid: "DigiD todavia no esta disponible. El acceso actual funciona con correo, Google y Apple si esta habilitado.",
      noteTitle: "Nota operativa",
      noteBody: "Aqui no se promete acceso con DigiD ni eIDAS. La autenticacion funciona por ahora solo con metodos compatibles de FinTax.",
    },
    passwordStrength: { label: "Fortaleza de contrasena", weak: "Debil", fair: "Aceptable", good: "Buena", strong: "Fuerte" },
    mfa: {
      required: "El acceso admin requiere MFA. Inicia sesion y completa el alta primero.",
      title: "Configura la verificacion en dos pasos",
      subtitle: "Anade una app autenticadora TOTP antes de continuar al espacio seguro.",
      loading: "Preparando la configuracion del autenticador...",
      qrTitle: "Escanea el codigo QR en tu app autenticadora",
      qrBody: "Despues de escanear, introduce el codigo de 6 digitos generado por la app para verificar el dispositivo.",
      codeLabel: "Codigo de verificacion de 6 digitos",
      codePlaceholder: "123456",
      verify: "Verificar codigo",
      verifying: "Verificando codigo...",
      skip: "Configurar mas tarde",
      continue: "Continuar al workspace",
      unavailable: "El alta MFA todavia no esta disponible en este proyecto de Supabase. Activa MFA a nivel de proyecto para completar el onboarding TOTP.",
      ready: "El autenticador esta listo. Verifica un codigo para terminar la configuracion.",
      success: "La verificacion en dos pasos ya esta habilitada para esta cuenta.",
      alreadyEnabled: "La verificacion en dos pasos ya esta activa en esta cuenta.",
    },
  },
  nl: {
    title: "Welkom terug",
    registerHint: "Voor het eerst hier?",
    registerHintLink: "Maak je veilige account aan",
    loginSubtitle: "Log in om verder te gaan naar je FinTax-workspace, begeleide flow en beschermde case-updates.",
    registerSubtitle: "Maak je account aan om te starten met beveiligde intake, onboarding en beschermde toegang tot Nederlandse belasting- en toeslagenflows.",
    forgotTitle: "Wachtwoord herstellen",
    forgotSubtitle: "Vul het e-mailadres van je account in en we sturen een veilige resetlink.",
    forgotLink: "Wachtwoord vergeten?",
    forgotSubmit: "Resetlink versturen",
    forgotBack: "Terug naar inloggen",
    resetInfo: "Als dit e-mailadres bestaat, is er een resetlink verstuurd.",
    checkEmailInfo: "Controleer je inbox om het account te bevestigen. Log daarna in en rond de tweestapsverificatie af vanuit de modal.",
    nationalityLabel: "Nationaliteit",
    nationalityPlaceholder: "Bijvoorbeeld: Spaans, Pools, Roemeens",
    hints: {
      fullName: "We gebruiken dit om je account, case-workspace en reviewspoor correct te koppelen.",
      nationality: "Nationaliteit kan invloed hebben op verdragen, heffingskortingen en de begeleiding later in de flow.",
      email: "Dit e-mailadres wordt gebruikt voor veilige toegang, casemeldingen en wachtwoordherstel.",
      password: "Gebruik een uniek wachtwoord. Wachtwoorden worden niet opgeslagen in browserconcepten.",
    },
    intent: {
      taxReturn: "Belastingintake aangevraagd",
      benefits: "Toeslagenintake aangevraagd",
      selectedService: "Geselecteerde dienst",
      noService: "Er is nog geen specifieke dienst gekozen. Je kunt wel een account maken en de juiste flow na het inloggen selecteren.",
      registerDefault: "We hebben account aanmaken standaard geopend zodat je direct kunt doorgaan naar de gevraagde flow.",
    },
    trust: {
      eyebrow: "Beveiligde accounttoegang",
      body: "De accountomgeving is gebouwd om toegang te beschermen, casecontinuiteit te bewaren en klanten voor te bereiden op een gestructureerde fiscale workflow.",
      points: [
        "Beschermde routes voordat casedata zichtbaar wordt",
        "Begeleide intake voor belasting en toeslagen",
        "Menselijke review en opvolging na authenticatie",
      ],
      methods: "Beschikbare inlogmethoden",
      digid: "DigiD is nog niet beschikbaar. Huidige toegang loopt via e-mail, Google en Apple als dat is ingeschakeld.",
      noteTitle: "Operationele notitie",
      noteBody: "Hier wordt geen DigiD- of eIDAS-login beloofd. Authenticatie loopt nu alleen via ondersteunde FinTax-methoden.",
    },
    passwordStrength: { label: "Wachtwoordsterkte", weak: "Zwak", fair: "Redelijk", good: "Goed", strong: "Sterk" },
    mfa: {
      required: "Beheertoegang vereist MFA. Log in en rond de activatie eerst af.",
      title: "Stel tweestapsverificatie in",
      subtitle: "Voeg een TOTP-authenticatorapp toe voordat je verdergaat naar de beveiligde workspace.",
      loading: "Authenticatorconfiguratie wordt voorbereid...",
      qrTitle: "Scan de QR-code in je authenticatorapp",
      qrBody: "Voer daarna de 6-cijferige code uit de app in om het apparaat te verifieren.",
      codeLabel: "6-cijferige verificatiecode",
      codePlaceholder: "123456",
      verify: "Code verifieren",
      verifying: "Code wordt geverifieerd...",
      skip: "Later instellen",
      continue: "Doorgaan naar workspace",
      unavailable: "MFA-activering is nog niet beschikbaar in dit Supabase-project. Activeer project-MFA om TOTP-onboarding af te ronden.",
      ready: "Authenticator is klaar. Verifieer een code om de configuratie af te ronden.",
      success: "Tweestapsverificatie is ingeschakeld voor dit account.",
      alreadyEnabled: "Tweestapsverificatie staat al aan op dit account.",
    },
  },
  pl: {
    title: "Witamy ponownie",
    registerHint: "Pierwszy raz tutaj?",
    registerHintLink: "Utworz bezpieczne konto",
    loginSubtitle: "Zaloguj sie, aby przejsc do workspace FinTax, prowadzonego flow i chronionych aktualizacji sprawy.",
    registerSubtitle: "Utworz konto, aby zaczac bezpieczny intake, onboarding i chroniony dostep do workflow podatkow i swiadczen.",
    forgotTitle: "Reset hasla",
    forgotSubtitle: "Podaj e-mail konta, a wyslemy bezpieczny link do resetu.",
    forgotLink: "Nie pamietasz hasla?",
    forgotSubmit: "Wyslij link",
    forgotBack: "Wroc do logowania",
    resetInfo: "Jesli ten e-mail istnieje, link do resetu zostal wyslany.",
    checkEmailInfo: "Sprawdz skrzynke, aby potwierdzic konto. Nastepnie zaloguj sie i zakoncz konfiguracje dwuetapowa z modala.",
    nationalityLabel: "Narodowosc",
    nationalityPlaceholder: "Na przyklad: hiszpanska, polska, rumunska",
    hints: {
      fullName: "Uzywamy tych danych do powiazania konta, workspace i sciezki review specjalisty.",
      nationality: "Narodowosc moze wplywac na umowy podatkowe, ulgi i wskazowki widoczne pozniej w flow sprawy.",
      email: "Ten e-mail sluzy do bezpiecznego dostepu, powiadomien o sprawie i odzyskiwania hasla.",
      password: "Uzyj unikalnego hasla. Hasla nie sa zapisywane w szkicu przegladarki.",
    },
    intent: {
      taxReturn: "Wybrano intake podatkowy",
      benefits: "Wybrano intake swiadczen",
      selectedService: "Wybrana usluga",
      noService: "Nie wybrano jeszcze konkretnej uslugi. Mozesz jednak utworzyc konto i wybrac wlasciwy flow po zalogowaniu.",
      registerDefault: "Domyslnie otworzylismy tworzenie konta, aby szybciej przejsc do wybranego flow.",
    },
    trust: {
      eyebrow: "Bezpieczny dostep do konta",
      body: "Obszar konta jest zaprojektowany tak, aby chronic dostep, zachowac ciaglosc sprawy i przygotowac klienta do uporzadkowanego workflow podatkowego.",
      points: [
        "Chronione trasy zanim pojawia sie dane sprawy",
        "Prowadzony intake dla podatkow i swiadczen",
        "Review specjalisty i dalsze kroki po zalogowaniu",
      ],
      methods: "Dostepne metody logowania",
      digid: "DigiD nie jest jeszcze dostepny. Obecny dostep dziala przez e-mail, Google i Apple, jesli sa wlaczone.",
      noteTitle: "Uwaga operacyjna",
      noteBody: "Nie obiecujemy tutaj logowania DigiD ani eIDAS. Uwierzytelnianie dziala obecnie tylko przez obslugiwane metody FinTax.",
    },
    passwordStrength: { label: "Sila hasla", weak: "Slabe", fair: "Srednie", good: "Dobre", strong: "Mocne" },
    mfa: {
      required: "Dostep administracyjny wymaga MFA. Zaloguj sie i najpierw dokoncz aktywacje.",
      title: "Skonfiguruj weryfikacje dwuetapowa",
      subtitle: "Dodaj aplikacje TOTP, zanim przejdziesz do bezpiecznego workspace.",
      loading: "Przygotowujemy konfiguracje aplikacji uwierzytelniajacej...",
      qrTitle: "Zeskanuj kod QR w aplikacji uwierzytelniajacej",
      qrBody: "Po zeskanowaniu wpisz 6-cyfrowy kod z aplikacji, aby potwierdzic urzadzenie.",
      codeLabel: "6-cyfrowy kod weryfikacyjny",
      codePlaceholder: "123456",
      verify: "Zweryfikuj kod",
      verifying: "Trwa weryfikacja kodu...",
      skip: "Ustawie pozniej",
      continue: "Przejdz do workspace",
      unavailable: "Wlaczenie MFA nie jest jeszcze dostepne w tym projekcie Supabase. Aktywuj MFA na poziomie projektu, aby ukonczyc onboarding TOTP.",
      ready: "Aplikacja jest gotowa. Zweryfikuj jeden kod, aby zakonczyc konfiguracje.",
      success: "Weryfikacja dwuetapowa jest wlaczona dla tego konta.",
      alreadyEnabled: "Weryfikacja dwuetapowa jest juz aktywna na tym koncie.",
    },
  },
  ro: {
    title: "Bine ai revenit",
    registerHint: "Prima data aici?",
    registerHintLink: "Creeaza un cont sigur",
    loginSubtitle: "Autentifica-te pentru a continua in workspace-ul FinTax, fluxul ghidat si actualizarile protejate.",
    registerSubtitle: "Creeaza contul pentru a incepe intake securizat, onboarding ghidat si acces protejat la taxe si beneficii in NL.",
    forgotTitle: "Reseteaza parola",
    forgotSubtitle: "Introdu e-mailul contului si iti trimitem un link securizat de resetare.",
    forgotLink: "Ai uitat parola?",
    forgotSubmit: "Trimite linkul",
    forgotBack: "Inapoi la autentificare",
    resetInfo: "Daca acest e-mail exista, a fost trimis un link de resetare.",
    checkEmailInfo: "Verifica inboxul pentru a confirma contul. Apoi autentifica-te si finalizeaza verificarea in doi pasi din modal.",
    nationalityLabel: "Nationalitate",
    nationalityPlaceholder: "De exemplu: spaniola, poloneza, romana",
    hints: {
      fullName: "Folosim aceste date pentru a corela contul, workspace-ul si traseul de review al specialistului.",
      nationality: "Nationalitatea poate influenta tratatele fiscale, creditele si ghidarea afisata mai tarziu in flux.",
      email: "Acest e-mail este folosit pentru acces securizat, notificari despre caz si recuperarea parolei.",
      password: "Foloseste o parola unica. Parolele nu sunt salvate in draftul browserului.",
    },
    intent: {
      taxReturn: "A fost solicitat intake fiscal",
      benefits: "A fost solicitat intake pentru beneficii",
      selectedService: "Serviciu selectat",
      noService: "Nu a fost selectat inca un serviciu specific. Poti totusi sa creezi contul si sa alegi fluxul exact dupa autentificare.",
      registerDefault: "Am deschis implicit crearea contului pentru a continua direct in fluxul solicitat.",
    },
    trust: {
      eyebrow: "Acces securizat la cont",
      body: "Zona de cont este construita pentru a proteja accesul, a pastra continuitatea cazului si a pregati clientul pentru un flux fiscal structurat.",
      points: [
        "Rute protejate inainte ca datele cazului sa fie afisate",
        "Intake ghidat pentru taxe si beneficii",
        "Review uman si urmarire dupa autentificare",
      ],
      methods: "Metode disponibile de autentificare",
      digid: "DigiD nu este disponibil inca. Accesul actual functioneaza prin e-mail, Google si Apple daca sunt activate.",
      noteTitle: "Nota operationala",
      noteBody: "Aici nu promitem autentificare DigiD sau eIDAS. Autentificarea functioneaza momentan doar prin metodele compatibile FinTax.",
    },
    passwordStrength: { label: "Puterea parolei", weak: "Slaba", fair: "Acceptabila", good: "Buna", strong: "Puternica" },
    mfa: {
      required: "Accesul admin necesita MFA. Autentifica-te si finalizeaza mai intai activarea.",
      title: "Configureaza verificarea in doi pasi",
      subtitle: "Adauga o aplicatie autentificator TOTP inainte sa continui in workspace-ul securizat.",
      loading: "Pregatim configurarea autentificatorului...",
      qrTitle: "Scaneaza codul QR in aplicatia de autentificare",
      qrBody: "Dupa scanare, introdu codul de 6 cifre generat de aplicatie pentru a verifica dispozitivul.",
      codeLabel: "Cod de verificare din 6 cifre",
      codePlaceholder: "123456",
      verify: "Verifica codul",
      verifying: "Se verifica codul...",
      skip: "Configurez mai tarziu",
      continue: "Continua catre workspace",
      unavailable: "Activarea MFA nu este inca disponibila in acest proiect Supabase. Activeaza MFA la nivel de proiect pentru a finaliza onboardingul TOTP.",
      ready: "Autentificatorul este pregatit. Verifica un cod pentru a finaliza configurarea.",
      success: "Verificarea in doi pasi este activa pentru acest cont.",
      alreadyEnabled: "Verificarea in doi pasi este deja activa pe acest cont.",
    },
  },
};

const uiCopy: Record<AppLocale, AuthUiCopy> = {
  en: {
    eyebrow: "Secure account access",
    tabs: { login: "Sign in", register: "Create account" },
    social: { google: "Continue with Google", apple: "Continue with Apple", emailDivider: "or continue with email" },
    form: {
      fullName: "Full name",
      fullNamePlaceholder: "Your full name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Repeat your password",
      submitLogin: "Sign in",
      submitRegister: "Create account",
      termsLabel: "I accept the",
      termsLink: "Terms and Privacy",
      backToLanding: "Back to landing",
      continueAccount: "Continue with your account",
    },
    a11y: { showPassword: "Show password", hidePassword: "Hide password", showConfirmPassword: "Show confirm password", hideConfirmPassword: "Hide confirm password" },
    validation: {
      fullName: "Enter your full name.",
      nationality: "Enter your nationality.",
      invalidEmail: "Enter a valid email address.",
      passwordLength: "Password must have at least 8 characters.",
      passwordMismatch: "Passwords do not match.",
      terms: "You must accept the terms.",
      code: "Enter a valid 6-digit code.",
    },
    panel: {
      title: "Secure account for your 2026 declaration",
      quote: "Structured onboarding, clear access control and human review from the first secure step.",
      quoteRole: "FinTax account guidance",
      note: "DigiD onboarding requires a formal DigiD agreement. Until that exists, authentication stays on email, Google and Apple only.",
      caseLabel: "Case preparation",
      caseTitle: "Your account keeps intake, document requests and follow-up in one place.",
      caseCopy: "The goal is a calmer first step, not a flashy auth screen.",
      verifyCopy: "Verify one TOTP code now to finish the secure setup for this account.",
      manualKey: "Manual key",
    },
  },
  es: {
    eyebrow: "Acceso seguro a la cuenta",
    tabs: { login: "Iniciar sesion", register: "Crear cuenta" },
    social: { google: "Continuar con Google", apple: "Continuar con Apple", emailDivider: "o continuar con email" },
    form: {
      fullName: "Nombre completo",
      fullNamePlaceholder: "Tu nombre completo",
      email: "Correo electronico",
      emailPlaceholder: "tu@ejemplo.com",
      password: "Contrasena",
      passwordPlaceholder: "Minimo 8 caracteres",
      confirmPassword: "Confirmar contrasena",
      confirmPasswordPlaceholder: "Repite tu contrasena",
      submitLogin: "Iniciar sesion",
      submitRegister: "Crear cuenta",
      termsLabel: "Acepto los",
      termsLink: "Terminos y Privacidad",
      backToLanding: "Volver al inicio",
      continueAccount: "Continuar con tu cuenta",
    },
    a11y: { showPassword: "Mostrar contrasena", hidePassword: "Ocultar contrasena", showConfirmPassword: "Mostrar confirmar contrasena", hideConfirmPassword: "Ocultar confirmar contrasena" },
    validation: {
      fullName: "Introduce tu nombre completo.",
      nationality: "Introduce tu nacionalidad.",
      invalidEmail: "Introduce un correo valido.",
      passwordLength: "La contrasena debe tener al menos 8 caracteres.",
      passwordMismatch: "Las contrasenas no coinciden.",
      terms: "Debes aceptar los terminos.",
      code: "Introduce un codigo valido de 6 digitos.",
    },
    panel: {
      title: "Cuenta segura para tu declaracion 2026",
      quote: "Onboarding estructurado, control de acceso claro y revision humana desde el primer paso seguro.",
      quoteRole: "Guia de cuenta FinTax",
      note: "El onboarding con DigiD requiere un acuerdo formal con DigiD. Hasta que exista, la autenticacion sigue solo con correo, Google y Apple.",
      caseLabel: "Preparacion del caso",
      caseTitle: "Tu cuenta mantiene intake, documentos y seguimiento en un solo lugar.",
      caseCopy: "El objetivo es un primer paso calmado y profesional, no una pantalla llamativa.",
      verifyCopy: "Verifica ahora un codigo TOTP para cerrar la configuracion segura de esta cuenta.",
      manualKey: "Clave manual",
    },
  },
  nl: {
    eyebrow: "Beveiligde accounttoegang",
    tabs: { login: "Inloggen", register: "Account maken" },
    social: { google: "Doorgaan met Google", apple: "Doorgaan met Apple", emailDivider: "of ga verder met e-mail" },
    form: {
      fullName: "Volledige naam",
      fullNamePlaceholder: "Je volledige naam",
      email: "E-mail",
      emailPlaceholder: "jij@voorbeeld.nl",
      password: "Wachtwoord",
      passwordPlaceholder: "Minimaal 8 tekens",
      confirmPassword: "Bevestig wachtwoord",
      confirmPasswordPlaceholder: "Herhaal je wachtwoord",
      submitLogin: "Inloggen",
      submitRegister: "Account maken",
      termsLabel: "Ik accepteer de",
      termsLink: "Voorwaarden en Privacy",
      backToLanding: "Terug naar landing",
      continueAccount: "Verder met je account",
    },
    a11y: { showPassword: "Toon wachtwoord", hidePassword: "Verberg wachtwoord", showConfirmPassword: "Toon bevestig wachtwoord", hideConfirmPassword: "Verberg bevestig wachtwoord" },
    validation: {
      fullName: "Vul je volledige naam in.",
      nationality: "Vul je nationaliteit in.",
      invalidEmail: "Vul een geldig e-mailadres in.",
      passwordLength: "Wachtwoord moet minimaal 8 tekens hebben.",
      passwordMismatch: "Wachtwoorden komen niet overeen.",
      terms: "Je moet de voorwaarden accepteren.",
      code: "Vul een geldige 6-cijferige code in.",
    },
    panel: {
      title: "Veilige accounttoegang voor je aangifte 2026",
      quote: "Gestructureerde onboarding, duidelijke toegangscontrole en menselijke review vanaf de eerste veilige stap.",
      quoteRole: "FinTax accountbegeleiding",
      note: "DigiD-onboarding vereist een formele DigiD-overeenkomst. Tot die tijd blijft authenticatie beperkt tot e-mail, Google en Apple.",
      caseLabel: "Casevoorbereiding",
      caseTitle: "Je account houdt intake, documentverzoeken en opvolging op een plek.",
      caseCopy: "Het doel is een rustige eerste stap, niet een opzichtig auth-scherm.",
      verifyCopy: "Verifieer nu een TOTP-code om de veilige configuratie van dit account af te ronden.",
      manualKey: "Handmatige sleutel",
    },
  },
  pl: {
    eyebrow: "Bezpieczny dostep do konta",
    tabs: { login: "Zaloguj sie", register: "Utworz konto" },
    social: { google: "Kontynuuj z Google", apple: "Kontynuuj z Apple", emailDivider: "lub kontynuuj emailem" },
    form: {
      fullName: "Imie i nazwisko",
      fullNamePlaceholder: "Twoje imie i nazwisko",
      email: "Adres e-mail",
      emailPlaceholder: "ty@przyklad.pl",
      password: "Haslo",
      passwordPlaceholder: "Minimum 8 znakow",
      confirmPassword: "Potwierdz haslo",
      confirmPasswordPlaceholder: "Powtorz haslo",
      submitLogin: "Zaloguj sie",
      submitRegister: "Utworz konto",
      termsLabel: "Akceptuje",
      termsLink: "Warunki i Prywatnosc",
      backToLanding: "Powrot do strony glownej",
      continueAccount: "Kontynuuj z kontem",
    },
    a11y: { showPassword: "Pokaz haslo", hidePassword: "Ukryj haslo", showConfirmPassword: "Pokaz potwierdzenie hasla", hideConfirmPassword: "Ukryj potwierdzenie hasla" },
    validation: {
      fullName: "Wpisz imie i nazwisko.",
      nationality: "Wpisz narodowosc.",
      invalidEmail: "Wprowadz prawidlowy adres e-mail.",
      passwordLength: "Haslo musi miec co najmniej 8 znakow.",
      passwordMismatch: "Hasla nie sa zgodne.",
      terms: "Musisz zaakceptowac warunki.",
      code: "Wpisz prawidlowy 6-cyfrowy kod.",
    },
    panel: {
      title: "Bezpieczne konto dla rozliczenia 2026",
      quote: "Uporzadkowany onboarding, jasna kontrola dostepu i review specjalisty od pierwszego bezpiecznego kroku.",
      quoteRole: "Wsparcie konta FinTax",
      note: "Onboarding DigiD wymaga formalnej umowy z DigiD. Do tego czasu uwierzytelnianie pozostaje przy e-mailu, Google i Apple.",
      caseLabel: "Przygotowanie sprawy",
      caseTitle: "Konto laczy intake, prosby o dokumenty i dalsze kroki w jednym miejscu.",
      caseCopy: "Celem jest spokojny pierwszy krok, a nie efektowny ekran logowania.",
      verifyCopy: "Zweryfikuj teraz kod TOTP, aby zakonczyc bezpieczna konfiguracje konta.",
      manualKey: "Klucz reczny",
    },
  },
  ro: {
    eyebrow: "Acces securizat la cont",
    tabs: { login: "Autentificare", register: "Creare cont" },
    social: { google: "Continua cu Google", apple: "Continua cu Apple", emailDivider: "sau continua cu email" },
    form: {
      fullName: "Nume complet",
      fullNamePlaceholder: "Numele tau complet",
      email: "Email",
      emailPlaceholder: "tu@exemplu.com",
      password: "Parola",
      passwordPlaceholder: "Cel putin 8 caractere",
      confirmPassword: "Confirma parola",
      confirmPasswordPlaceholder: "Repeta parola",
      submitLogin: "Autentificare",
      submitRegister: "Creare cont",
      termsLabel: "Accept",
      termsLink: "Termenii si Politica de confidentialitate",
      backToLanding: "Inapoi la pagina principala",
      continueAccount: "Continua cu contul tau",
    },
    a11y: { showPassword: "Afiseaza parola", hidePassword: "Ascunde parola", showConfirmPassword: "Afiseaza confirmarea parolei", hideConfirmPassword: "Ascunde confirmarea parolei" },
    validation: {
      fullName: "Introdu numele complet.",
      nationality: "Introdu nationalitatea.",
      invalidEmail: "Introdu o adresa de email valida.",
      passwordLength: "Parola trebuie sa aiba cel putin 8 caractere.",
      passwordMismatch: "Parolele nu coincid.",
      terms: "Trebuie sa accepti termenii.",
      code: "Introdu un cod valid din 6 cifre.",
    },
    panel: {
      title: "Cont securizat pentru declaratia ta 2026",
      quote: "Onboarding structurat, control clar al accesului si review uman din primul pas securizat.",
      quoteRole: "Ghidaj cont FinTax",
      note: "Onboardingul DigiD necesita un acord formal cu DigiD. Pana atunci, autentificarea ramane limitata la email, Google si Apple.",
      caseLabel: "Pregatirea cazului",
      caseTitle: "Contul tau tine intake-ul, documentele si urmarirea intr-un singur loc.",
      caseCopy: "Scopul este un prim pas calm si profesionist, nu un ecran de autentificare strident.",
      verifyCopy: "Verifica acum un cod TOTP pentru a finaliza configurarea sigura a contului.",
      manualKey: "Cheie manuala",
    },
  },
};

function getCopy(locale: string) {
  return extraCopy[(locale in extraCopy ? locale : "en") as AppLocale];
}

function getUiCopy(locale: string) {
  return uiCopy[(locale in uiCopy ? locale : "en") as AppLocale];
}

function normalizeIntentPath(intent?: string | null, service?: string | null) {
  const resolvedIntent: AuthIntent | null = intent === "benefits" || intent === "tax-return" ? intent : null;
  if (!resolvedIntent) return "/app";
  const base = resolvedIntent === "benefits" ? "/benefits" : "/tax-return";
  if (!service) return base;
  const params = new URLSearchParams({ service });
  return `${base}?${params.toString()}`;
}

function readPendingIntent(searchParams: URLSearchParams | AuthScreenSearchParams): PendingAuthIntent | null {
  const get = (key: keyof AuthScreenSearchParams) =>
    searchParams instanceof URLSearchParams ? searchParams.get(key) : searchParams[key] ?? null;
  const intent = get("intent");
  const service = get("service");
  const next = get("next");
  if (next && next.startsWith("/")) return { intent: "tax-return", next, service: undefined };
  if (intent === "tax-return" || intent === "benefits") {
    return { intent, service: service ?? undefined, next: normalizeIntentPath(intent, service) };
  }
  return null;
}

function getStoredPendingIntent(): PendingAuthIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_INTENT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingAuthIntent>;
    if (!parsed.next || typeof parsed.next !== "string" || !parsed.next.startsWith("/")) return null;
    return {
      intent: parsed.intent === "benefits" ? "benefits" : "tax-return",
      service: typeof parsed.service === "string" ? parsed.service : undefined,
      next: parsed.next,
    };
  } catch {
    return null;
  }
}

function storePendingIntent(pending: PendingAuthIntent | null) {
  if (typeof window === "undefined") return;
  if (!pending) {
    window.sessionStorage.removeItem(AUTH_INTENT_SESSION_KEY);
    return;
  }
  window.sessionStorage.setItem(AUTH_INTENT_SESSION_KEY, JSON.stringify(pending));
}

function resolveAuthSuccessPath(searchParams: URLSearchParams | AuthScreenSearchParams) {
  return readPendingIntent(searchParams)?.next ?? getStoredPendingIntent()?.next ?? "/app";
}

function withLocalePrefix(path: string, locale: AppLocale) {
  if (path.startsWith(`/${locale}/`)) return path;
  return `/${locale}${path}`;
}

function buildNextPathForRegister(searchParams: AuthScreenSearchParams) {
  const nextPath = resolveAuthSuccessPath(searchParams);
  return nextPath === "/app" ? "/onboarding" : `/onboarding?next=${encodeURIComponent(nextPath)}`;
}

function readMfaAfterLoginFlag() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(AUTH_MFA_AFTER_LOGIN_KEY) === "1";
}

function setMfaAfterLoginFlag(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) {
    window.sessionStorage.setItem(AUTH_MFA_AFTER_LOGIN_KEY, "1");
    return;
  }
  window.sessionStorage.removeItem(AUTH_MFA_AFTER_LOGIN_KEY);
}
function FieldLabel({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <label htmlFor={htmlFor} className="block text-xs uppercase tracking-[0.12em] text-muted">{children}</label>
      {hint ? (
        <Tooltip content={hint}>
          <button type="button" className="focus-ring rounded-full text-muted transition-colors hover:text-text" aria-label={String(children)}>
            <Info className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}

function FieldMessage({ error, hint }: { error?: string; hint?: string }) {
  if (error) return <p className="mt-1.5 text-xs text-error">{error}</p>;
  if (hint) return <p className="mt-1.5 text-xs text-muted">{hint}</p>;
  return null;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-error/30 bg-error/10 px-4 py-3 text-sm text-red-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
      <p>{message}</p>
    </div>
  );
}

function InfoBanner({ message, tone = "default" }: { message: string; tone?: "default" | "warn" | "success" }) {
  const toneClass = tone === "warn" ? "border-copper/35 bg-copper/10 text-secondary" : tone === "success" ? "border-green/30 bg-green/10 text-secondary" : "border-border/60 bg-surface2/60 text-secondary";
  return <div className={cn("mb-4 rounded-[var(--radius-md)] border px-4 py-3 text-sm", toneClass)}>{message}</div>;
}

function PasswordMeter({ label, scoreLabels, value }: { label: string; scoreLabels: AuthExtraCopy["passwordStrength"]; value: string }) {
  const result = React.useMemo(() => zxcvbn(value || ""), [value]);
  const score = value ? result.score : 0;
  const width = value ? `${((score + 1) / 5) * 100}%` : "8%";
  const tone = score <= 1 ? "bg-error" : score === 2 ? "bg-copper" : score === 3 ? "bg-green/80" : "bg-green";
  const labelText = score <= 0 ? scoreLabels.weak : score === 1 ? scoreLabels.fair : score === 2 ? scoreLabels.good : scoreLabels.strong;

  return (
    <div aria-live="polite" className="mt-3" data-testid="password-strength-meter">
      <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span>{labelText}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border/70">
        <div className={cn("h-full rounded-full transition-[width] duration-300", tone)} style={{ width }} />
      </div>
    </div>
  );
}

function buildSchemas(ui: AuthUiCopy) {
  const loginSchema = z.object({
    email: z.string().email(ui.validation.invalidEmail),
    password: z.string().min(8, ui.validation.passwordLength),
  });

  const registerSchema = z
    .object({
      fullName: z.string().min(2, ui.validation.fullName),
      nationality: z.string().min(2, ui.validation.nationality),
      email: z.string().email(ui.validation.invalidEmail),
      password: z.string().min(8, ui.validation.passwordLength),
      confirmPassword: z.string().min(8, ui.validation.passwordLength),
      terms: z.boolean().refine((value) => value, ui.validation.terms),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: ui.validation.passwordMismatch,
      path: ["confirmPassword"],
    });

  const forgotSchema = z.object({ email: z.string().email(ui.validation.invalidEmail) });

  return { loginSchema, registerSchema, forgotSchema };
}

export function AuthScreen({ initialSearchParams = {} }: { initialSearchParams?: AuthScreenSearchParams }) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const copy = getCopy(locale);
  const ui = getUiCopy(locale);
  const supabase = createClient();
  const pendingIntent = React.useMemo(() => readPendingIntent(initialSearchParams), [initialSearchParams]);
  const mfaRequired = initialSearchParams.reason === "mfa_required";
  const defaultMode: AuthMode = mfaRequired ? "login" : pendingIntent ? "register" : "login";
  const { loginSchema, registerSchema, forgotSchema } = React.useMemo(() => buildSchemas(ui), [ui]);

  const [mode, setMode] = React.useState<AuthMode>(defaultMode);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<{ message: string; tone?: "default" | "warn" | "success" } | null>(
    mfaRequired ? { message: copy.mfa.required, tone: "warn" } : pendingIntent ? { message: copy.intent.registerDefault } : null,
  );
  const [oauthLoading, setOauthLoading] = React.useState<"google" | "apple" | null>(null);
  const [mfaOpen, setMfaOpen] = React.useState(false);
  const [mfaLoading, setMfaLoading] = React.useState(false);
  const [mfaError, setMfaError] = React.useState<string | null>(null);
  const [mfaInfo, setMfaInfo] = React.useState<string | null>(null);
  const [mfaCode, setMfaCode] = React.useState("");
  const [mfaFactorId, setMfaFactorId] = React.useState<string | null>(null);
  const [mfaQrCode, setMfaQrCode] = React.useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = React.useState<string | null>(null);
  const [mfaReady, setMfaReady] = React.useState(false);
  const [mfaVerified, setMfaVerified] = React.useState(false);
  const [postAuthDestination, setPostAuthDestination] = React.useState(resolveAuthSuccessPath(initialSearchParams));

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" }, mode: "onTouched" });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", nationality: "", email: "", password: "", confirmPassword: "", terms: false },
    mode: "onTouched",
  });
  const forgotForm = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" }, mode: "onTouched" });

  const loginEmail = useWatch({ control: loginForm.control, name: "email" }) ?? "";
  const registerDraftValues = useWatch({ control: registerForm.control });
  const forgotEmail = useWatch({ control: forgotForm.control, name: "email" }) ?? "";
  const registerPassword = useWatch({ control: registerForm.control, name: "password" }) ?? "";

  useEncryptedFormDraft({ storageKey: LOGIN_DRAFT_KEY, value: { email: loginEmail }, onRestore: (value) => loginForm.reset({ email: value.email ?? "", password: "" }) });
  useEncryptedFormDraft({
    storageKey: REGISTER_DRAFT_KEY,
    value: { fullName: registerDraftValues.fullName ?? "", nationality: registerDraftValues.nationality ?? "", email: registerDraftValues.email ?? "", terms: registerDraftValues.terms ?? false },
    onRestore: (value) => registerForm.reset({ fullName: value.fullName ?? "", nationality: value.nationality ?? "", email: value.email ?? "", password: "", confirmPassword: "", terms: value.terms ?? false }),
  });
  useEncryptedFormDraft({ storageKey: FORGOT_DRAFT_KEY, value: { email: forgotEmail }, onRestore: (value) => forgotForm.reset({ email: value.email ?? "" }) });

  React.useEffect(() => { setMode(defaultMode); }, [defaultMode]);
  React.useEffect(() => { storePendingIntent(pendingIntent); }, [pendingIntent]);

  const clearSafeDrafts = React.useCallback(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(LOGIN_DRAFT_KEY);
    window.sessionStorage.removeItem(REGISTER_DRAFT_KEY);
    window.sessionStorage.removeItem(FORGOT_DRAFT_KEY);
  }, []);

  const resetTransientFeedback = React.useCallback(() => {
    setServerError(null);
    setInfoMessage(mfaRequired ? { message: copy.mfa.required, tone: "warn" } : pendingIntent ? { message: copy.intent.registerDefault } : null);
  }, [copy, mfaRequired, pendingIntent]);

  const openMfaDialog = React.useCallback((nextPath: string) => {
    setPostAuthDestination(nextPath);
    setMfaError(null);
    setMfaInfo(null);
    setMfaCode("");
    setMfaFactorId(null);
    setMfaQrCode(null);
    setMfaSecret(null);
    setMfaVerified(false);
    setMfaReady(false);
    setMfaOpen(true);
  }, []);
  const prepareMfaEnrollment = React.useCallback(async () => {
    if (!mfaOpen || !supabase) return;

    setMfaLoading(true);
    setMfaError(null);
    setMfaInfo(copy.mfa.loading);

    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) {
      setMfaLoading(false);
      setMfaError(copy.mfa.unavailable);
      setMfaInfo(null);
      return;
    }

    const verifiedFactor = factors.data.totp.find((factor) => factor.status === "verified");
    if (verifiedFactor) {
      setMfaFactorId(verifiedFactor.id);
      setMfaVerified(true);
      setMfaReady(true);
      setMfaLoading(false);
      setMfaInfo(copy.mfa.alreadyEnabled);
      setMfaAfterLoginFlag(false);
      return;
    }

    const staleFactor = factors.data.totp.find((factor) => factor.status !== "verified");
    if (staleFactor) {
      await supabase.auth.mfa.unenroll({ factorId: staleFactor.id });
    }

    const enrollment = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "FinTax", friendlyName: "FinTax Authenticator" });
    if (enrollment.error || !enrollment.data) {
      setMfaLoading(false);
      setMfaError(copy.mfa.unavailable);
      setMfaInfo(null);
      return;
    }

    const enrollmentData = enrollment.data as typeof enrollment.data & { totp?: { qr_code?: string; secret?: string; uri?: string } };
    setMfaFactorId(enrollmentData.id);
    setMfaSecret(enrollmentData.totp?.secret ?? null);

    const rawQr = enrollmentData.totp?.qr_code;
    if (rawQr) {
      setMfaQrCode(rawQr.startsWith("data:") ? rawQr : `data:image/svg+xml;utf8,${encodeURIComponent(rawQr)}`);
    } else if (enrollmentData.totp?.uri) {
      setMfaQrCode(await QRCode.toDataURL(enrollmentData.totp.uri));
    } else {
      setMfaQrCode(null);
    }

    setMfaReady(true);
    setMfaLoading(false);
    setMfaInfo(copy.mfa.ready);
  }, [copy.mfa, mfaOpen, supabase]);

  React.useEffect(() => {
    if (!mfaOpen) return;
    void prepareMfaEnrollment();
  }, [mfaOpen, prepareMfaEnrollment]);

  const handleModeChange = React.useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setServerError(null);
    setInfoMessage(nextMode === "register" && pendingIntent ? { message: copy.intent.registerDefault } : null);
  }, [copy.intent.registerDefault, pendingIntent]);

  const handleOAuth = React.useCallback(async (provider: "google" | "apple") => {
    resetTransientFeedback();
    if (!supabase) {
      setServerError("Supabase is not configured in this environment.");
      return;
    }

    setOauthLoading(provider);
    const nextPath = resolveAuthSuccessPath(initialSearchParams);
    const redirectTo = `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(withLocalePrefix(nextPath, locale))}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    setOauthLoading(null);
    if (error) setServerError(error.message);
  }, [initialSearchParams, locale, resetTransientFeedback, supabase]);

  const onLoginSubmit = loginForm.handleSubmit(async (values) => {
    resetTransientFeedback();
    if (!supabase) {
      setServerError("Supabase is not configured in this environment.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) {
      setServerError(error.message);
      return;
    }

    clearSafeDrafts();
    const nextPath = resolveAuthSuccessPath(initialSearchParams);
    if (mfaRequired || readMfaAfterLoginFlag()) {
      openMfaDialog(nextPath);
      return;
    }

    storePendingIntent(null);
    router.push(nextPath);
  });

  const onRegisterSubmit = registerForm.handleSubmit(async (values) => {
    resetTransientFeedback();
    if (!supabase) {
      setServerError("Supabase is not configured in this environment.");
      return;
    }

    const redirectTarget = resolveAuthSuccessPath(initialSearchParams);
    const emailRedirectTo = `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(withLocalePrefix(redirectTarget, locale))}`;
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName, nationality: values.nationality }, emailRedirectTo },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    clearSafeDrafts();
    if (data.session) {
      setMfaAfterLoginFlag(false);
      openMfaDialog(buildNextPathForRegister(initialSearchParams));
      return;
    }

    setMfaAfterLoginFlag(true);
    setMode("login");
    setInfoMessage({ message: copy.checkEmailInfo, tone: "success" });
  });

  const onForgotSubmit = forgotForm.handleSubmit(async (values) => {
    resetTransientFeedback();
    if (!supabase) {
      setServerError("Supabase is not configured in this environment.");
      return;
    }

    const redirectTo = `${window.location.origin}/${locale}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo });
    if (error) {
      setServerError(error.message);
      return;
    }

    setInfoMessage({ message: copy.resetInfo, tone: "success" });
  });

  const onVerifyMfa = async () => {
    if (!supabase || !mfaFactorId) {
      setMfaError(copy.mfa.unavailable);
      return;
    }
    if (!/^\d{6}$/.test(mfaCode)) {
      setMfaError(ui.validation.code);
      return;
    }

    setMfaLoading(true);
    setMfaError(null);

    const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
    if (challenge.error || !challenge.data) {
      setMfaLoading(false);
      setMfaError(challenge.error?.message ?? copy.mfa.unavailable);
      return;
    }

    const verification = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.data.id, code: mfaCode });
    setMfaLoading(false);
    if (verification.error) {
      setMfaError(verification.error.message);
      return;
    }

    setMfaVerified(true);
    setMfaInfo(copy.mfa.success);
    setMfaAfterLoginFlag(false);
  };

  const closeMfaAndContinue = () => {
    setMfaOpen(false);
    storePendingIntent(null);
    router.push(postAuthDestination);
  };

  const activeSubmitting = mode === "login" ? loginForm.formState.isSubmitting : mode === "register" ? registerForm.formState.isSubmitting : forgotForm.formState.isSubmitting;
  const intentTitle = pendingIntent ? (pendingIntent.intent === "tax-return" ? copy.intent.taxReturn : copy.intent.benefits) : null;

  return (
    <div className="min-h-screen bg-mesh">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.88fr)]">
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-[640px]">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-text">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-green/25 bg-green/10 font-heading text-sm text-green">F</span>
                <span className="font-heading text-lg tracking-tight">FinTax</span>
              </Link>
              <Badge variant="neutral">{ui.eyebrow}</Badge>
            </div>

            <Card variant="panel" padding="none" className="overflow-hidden border-border/70 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="border-b border-border/35 bg-surface/70 px-5 py-5 sm:px-7 sm:py-6">
                <p className="text-xs uppercase tracking-[0.16em] text-copper">{ui.eyebrow}</p>
                <h1 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text sm:text-[2.35rem]">{copy.title}</h1>
                <p className="mt-3 max-w-[58ch] text-sm leading-6 text-secondary">{mode === "register" ? copy.registerSubtitle : mode === "forgot" ? copy.forgotSubtitle : copy.loginSubtitle}</p>
              </div>
              <div className="px-5 py-5 sm:px-7 sm:py-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <Tabs value={mode === "forgot" ? "login" : mode} defaultValue={defaultMode} onValueChange={(value) => handleModeChange(value as AuthMode)} className="flex-1">
                    <TabsList className="w-full">
                      <TabsTrigger value="login" className="flex-1">{ui.tabs.login}</TabsTrigger>
                      <TabsTrigger value="register" className="flex-1">{ui.tabs.register}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {mode !== "register" ? (
                    <button type="button" className="text-sm font-medium text-copper transition-colors hover:text-text" onClick={() => handleModeChange("register")}>
                      {copy.registerHint} {copy.registerHintLink}
                    </button>
                  ) : null}
                </div>

                {serverError ? <ErrorBanner message={serverError} /> : null}
                {infoMessage ? <InfoBanner message={infoMessage.message} tone={infoMessage.tone} /> : null}
                {pendingIntent && !pendingIntent.service ? <InfoBanner message={copy.intent.noService} tone="warn" /> : null}

                {mode !== "forgot" ? (
                  <>
                    <div className="mb-5 grid gap-3 sm:grid-cols-2">
                      <Button type="button" variant="secondary" size="lg" className="justify-center" onClick={() => void handleOAuth("google")} disabled={oauthLoading !== null}>
                        {oauthLoading === "google" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        {ui.social.google}
                      </Button>
                      <Button type="button" variant="secondary" size="lg" className="justify-center" onClick={() => void handleOAuth("apple")} disabled={oauthLoading !== null}>
                        {oauthLoading === "apple" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Apple className="h-4 w-4" />}
                        {ui.social.apple}
                      </Button>
                    </div>
                    <div className="mb-5 flex items-center gap-3 text-xs text-muted">
                      <span className="h-px flex-1 bg-border/50" />
                      <span>{ui.social.emailDivider}</span>
                      <span className="h-px flex-1 bg-border/50" />
                    </div>
                  </>
                ) : null}

                {mode === "login" ? (
                  <form className="space-y-4" onSubmit={onLoginSubmit} noValidate>
                    <div>
                      <FieldLabel htmlFor="login-email" hint={copy.hints.email}>{ui.form.email}</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input id="login-email" type="email" autoComplete="email" size="lg" placeholder={ui.form.emailPlaceholder} className={cn("pl-11", loginForm.formState.errors.email && "border-error/60 focus-visible:border-error")} {...loginForm.register("email")} />
                      </div>
                      <FieldMessage error={loginForm.formState.errors.email?.message} />
                    </div>

                    <div>
                      <FieldLabel htmlFor="login-password" hint={copy.hints.password}>{ui.form.password}</FieldLabel>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" size="lg" placeholder={ui.form.passwordPlaceholder} className={cn("pl-11 pr-11", loginForm.formState.errors.password && "border-error/60 focus-visible:border-error")} {...loginForm.register("password")} />
                        <button type="button" className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-text" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? ui.a11y.hidePassword : ui.a11y.showPassword}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FieldMessage error={loginForm.formState.errors.password?.message} />
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">{ui.form.continueAccount}</span>
                      <button type="button" className="font-medium text-copper transition-colors hover:text-text" onClick={() => handleModeChange("forgot")}>{copy.forgotLink}</button>
                    </div>

                    <Button type="submit" size="lg" className="w-full justify-center" disabled={activeSubmitting}>
                      {activeSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      {ui.form.submitLogin}
                    </Button>
                  </form>
                ) : null}

                {mode === "register" ? (
                  <form className="space-y-4" onSubmit={onRegisterSubmit} noValidate>
                    {intentTitle ? (
                      <div className="rounded-[var(--radius-lg)] border border-green/20 bg-green/10 px-4 py-3 text-sm text-secondary">
                        <div className="flex items-center gap-2 font-medium text-text">
                          <ShieldCheck className="h-4 w-4 text-green" />
                          <span>{intentTitle}</span>
                        </div>
                        {pendingIntent?.service ? <p className="mt-2 text-xs text-muted">{copy.intent.selectedService}: <span className="font-medium text-secondary">{pendingIntent.service}</span></p> : null}
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel htmlFor="reg-name" hint={copy.hints.fullName}>{ui.form.fullName}</FieldLabel>
                        <Input id="reg-name" type="text" autoComplete="name" size="lg" placeholder={ui.form.fullNamePlaceholder} className={cn(registerForm.formState.errors.fullName && "border-error/60 focus-visible:border-error")} {...registerForm.register("fullName")} />
                        <FieldMessage error={registerForm.formState.errors.fullName?.message} />
                      </div>

                      <div>
                        <FieldLabel htmlFor="reg-nationality" hint={copy.hints.nationality}>{copy.nationalityLabel}</FieldLabel>
                        <Input id="reg-nationality" type="text" autoComplete="country-name" size="lg" placeholder={copy.nationalityPlaceholder} className={cn(registerForm.formState.errors.nationality && "border-error/60 focus-visible:border-error")} {...registerForm.register("nationality")} />
                        <FieldMessage error={registerForm.formState.errors.nationality?.message} />
                      </div>
                    </div>

                    <div>
                      <FieldLabel htmlFor="reg-email" hint={copy.hints.email}>{ui.form.email}</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input id="reg-email" type="email" autoComplete="email" size="lg" placeholder={ui.form.emailPlaceholder} className={cn("pl-11", registerForm.formState.errors.email && "border-error/60 focus-visible:border-error")} {...registerForm.register("email")} />
                      </div>
                      <FieldMessage error={registerForm.formState.errors.email?.message} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel htmlFor="reg-password" hint={copy.hints.password}>{ui.form.password}</FieldLabel>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                          <Input id="reg-password" type={showPassword ? "text" : "password"} autoComplete="new-password" size="lg" placeholder={ui.form.passwordPlaceholder} className={cn("pl-11 pr-11", registerForm.formState.errors.password && "border-error/60 focus-visible:border-error")} {...registerForm.register("password")} />
                          <button type="button" className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-text" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? ui.a11y.hidePassword : ui.a11y.showPassword}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FieldMessage error={registerForm.formState.errors.password?.message} />
                      </div>

                      <div>
                        <FieldLabel htmlFor="reg-confirm">{ui.form.confirmPassword}</FieldLabel>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                          <Input id="reg-confirm" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" size="lg" placeholder={ui.form.confirmPasswordPlaceholder} className={cn("pl-11 pr-11", registerForm.formState.errors.confirmPassword && "border-error/60 focus-visible:border-error")} {...registerForm.register("confirmPassword")} />
                          <button type="button" className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-text" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? ui.a11y.hideConfirmPassword : ui.a11y.showConfirmPassword}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FieldMessage error={registerForm.formState.errors.confirmPassword?.message} />
                      </div>
                    </div>

                    <PasswordMeter label={copy.passwordStrength.label} scoreLabels={copy.passwordStrength} value={registerPassword} />

                    <div className="rounded-[var(--radius-lg)] border border-border/60 bg-surface2/55 px-4 py-3">
                      <label htmlFor="reg-terms" className="flex items-start gap-3 text-sm leading-6 text-secondary">
                        <input id="reg-terms" type="checkbox" className="mt-1 h-4 w-4 rounded border-border/70 bg-surface2/70 accent-[rgb(var(--accent-green))]" {...registerForm.register("terms")} />
                        <span>{ui.form.termsLabel} <Link href="/legal/terms" className="font-medium text-copper underline underline-offset-4">{ui.form.termsLink}</Link></span>
                      </label>
                      {registerForm.formState.errors.terms ? <p className="mt-2 text-xs text-error">{String(registerForm.formState.errors.terms.message)}</p> : null}
                    </div>

                    <Button type="submit" size="lg" className="w-full justify-center" disabled={activeSubmitting}>
                      {activeSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      {ui.form.submitRegister}
                    </Button>
                  </form>
                ) : null}
                {mode === "forgot" ? (
                  <form className="space-y-4" onSubmit={onForgotSubmit} noValidate>
                    <div>
                      <h2 className="font-heading text-2xl tracking-[-0.03em] text-text">{copy.forgotTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-secondary">{copy.forgotSubtitle}</p>
                    </div>

                    <div>
                      <FieldLabel htmlFor="forgot-email" hint={copy.hints.email}>{ui.form.email}</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input id="forgot-email" type="email" autoComplete="email" size="lg" placeholder={ui.form.emailPlaceholder} className={cn("pl-11", forgotForm.formState.errors.email && "border-error/60 focus-visible:border-error")} {...forgotForm.register("email")} />
                      </div>
                      <FieldMessage error={forgotForm.formState.errors.email?.message} />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" size="lg" disabled={activeSubmitting}>
                        {activeSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        {copy.forgotSubmit}
                      </Button>
                      <Button type="button" variant="ghost" size="lg" onClick={() => handleModeChange("login")}>{copy.forgotBack}</Button>
                    </div>
                  </form>
                ) : null}

                <div className="mt-6 border-t border-border/35 pt-5">
                  <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "border-transparent px-0")}>{ui.form.backToLanding}</Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <aside className="hidden border-l border-border/35 bg-[radial-gradient(circle_at_top,rgba(53,83,68,0.3),transparent_42%),linear-gradient(180deg,#0d1712_0%,#121d17_48%,#18241d_100%)] px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-12">
          <div>
            <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/10 font-heading text-sm text-white">F</span>
              <span className="font-heading text-lg tracking-tight">FinTax</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <Badge variant="neutral" className="border-white/15 bg-white/8 text-white">{copy.trust.eyebrow}</Badge>
              <h2 className="mt-4 max-w-[14ch] font-heading text-[2.4rem] leading-[0.96] tracking-[-0.04em] text-white">{ui.panel.title}</h2>
              <p className="mt-4 max-w-[46ch] text-sm leading-7 text-white/78">{copy.trust.body}</p>
            </div>

            <Card variant="panel" padding="md" className="border-white/10 bg-white/6 text-white shadow-[0_24px_60px_rgba(3,8,6,0.35)] motion-safe:transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/15">
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">{ui.panel.caseLabel}</p>
              <p className="mt-3 font-heading text-2xl leading-tight">{ui.panel.caseTitle}</p>
              <p className="mt-3 text-sm leading-6 text-white/72">{ui.panel.caseCopy}</p>
              <div className="mt-6 grid gap-3">
                {copy.trust.points.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-white/6 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-300" />
                    <p className="text-sm leading-6 text-white/82">{point}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <Card variant="panel" padding="md" className="border-white/10 bg-white/6 text-white motion-safe:transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/15">
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">{copy.trust.methods}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs">Email</span>
                  <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs">Google</span>
                  <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs">Apple</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/72">{copy.trust.digid}</p>
              </Card>

              <Card variant="panel" padding="md" className="border-white/10 bg-white/6 text-white motion-safe:transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/15">
                <p className="font-heading text-xl leading-tight">{ui.panel.quote}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/55">{ui.panel.quoteRole}</p>
                <div className="mt-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/6 px-4 py-3 text-sm leading-6 text-white/72">{ui.panel.note}</div>
              </Card>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-6 text-white/76">
            <div className="mb-1 text-xs uppercase tracking-[0.14em] text-white/55">{copy.trust.noteTitle}</div>
            {copy.trust.noteBody}
          </div>
        </aside>

        <Dialog open={mfaOpen} onOpenChange={setMfaOpen}>
          <DialogContent className="max-w-2xl border-border/70 bg-surface" showClose={!mfaRequired}>
            <DialogHeader>
              <DialogTitle>{copy.mfa.title}</DialogTitle>
              <DialogDescription>{copy.mfa.subtitle}</DialogDescription>
            </DialogHeader>

            {mfaError ? <ErrorBanner message={mfaError} /> : null}
            {mfaInfo ? <InfoBanner message={mfaInfo} tone={mfaVerified ? "success" : "default"} /> : null}

            {mfaLoading && !mfaReady ? (
              <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border/60 bg-surface2/60 px-4 py-4 text-sm text-secondary">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>{copy.mfa.loading}</span>
              </div>
            ) : null}

            {mfaReady ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
                <Card variant="soft" padding="md" className="border-border/65 bg-surface2/60">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">{copy.mfa.qrTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">{copy.mfa.qrBody}</p>
                  <div className="mt-5 flex min-h-[240px] items-center justify-center rounded-[var(--radius-lg)] border border-border/60 bg-white p-4">
                    {mfaQrCode ? <img src={mfaQrCode} alt="MFA QR code" className="h-48 w-48 rounded-md object-contain" /> : <Smartphone className="h-10 w-10 text-muted" />}
                  </div>
                  {mfaSecret ? (
                    <div className="mt-4 rounded-[var(--radius-lg)] border border-border/60 bg-surface px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">{ui.panel.manualKey}</p>
                      <p className="mt-2 break-all font-mono text-sm text-text">{mfaSecret}</p>
                    </div>
                  ) : null}
                </Card>

                <div className="space-y-4">
                  <Card variant="outline" padding="md" className="motion-safe:transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-green/35">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-1 h-5 w-5 text-green" />
                      <div>
                        <p className="font-medium text-text">{copy.mfa.codeLabel}</p>
                        <p className="mt-1 text-sm leading-6 text-secondary">{ui.panel.verifyCopy}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Input value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" size="lg" placeholder={copy.mfa.codePlaceholder} aria-label={copy.mfa.codeLabel} />
                    </div>
                  </Card>

                  <Card variant="soft" padding="md" className="border-border/65 bg-surface2/45">
                    <p className="font-medium text-text">{copy.trust.noteTitle}</p>
                    <p className="mt-2 text-sm leading-6 text-secondary">{copy.trust.noteBody}</p>
                  </Card>
                </div>
              </div>
            ) : null}

            <DialogFooter className="justify-between">
              {!mfaRequired ? <Button type="button" variant="ghost" size="lg" onClick={closeMfaAndContinue}>{copy.mfa.skip}</Button> : <span className="text-sm text-muted">{copy.mfa.required}</span>}
              <div className="flex flex-wrap gap-3">
                {!mfaVerified ? (
                  <Button type="button" size="lg" onClick={() => void onVerifyMfa()} disabled={!mfaReady || mfaLoading}>
                    {mfaLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {mfaLoading ? copy.mfa.verifying : copy.mfa.verify}
                  </Button>
                ) : (
                  <Button type="button" size="lg" onClick={closeMfaAndContinue}>{copy.mfa.continue}</Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
