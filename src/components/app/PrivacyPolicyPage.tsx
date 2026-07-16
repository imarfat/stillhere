"use client"

import { LegalPageLayout, LegalSection } from "@/components/app/LegalPageLayout"

export function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <LegalSection title="Overview">
        <p>
          StillHere helps families create and share digital memorial pages. This Privacy Policy
          explains what information we collect, how we use it, and the choices you have.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>We may collect:</p>
        <ul>
          <li>Account details such as your name, email address, and password.</li>
          <li>Memorial content you add, including photos, text, tributes, and guestbook messages.</li>
          <li>Basic usage data needed to operate and secure the service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use information to:</p>
        <ul>
          <li>Provide, maintain, and improve StillHere.</li>
          <li>Let you create, edit, and share memorial pages.</li>
          <li>Respond to support requests and protect against abuse or misuse.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Memorial and guest content">
        <p>
          Memorial pages you publish may be visible to anyone with the link or QR code you share.
          Guestbook entries and tributes submitted by visitors may be stored and displayed on the
          memorial page according to your settings.
        </p>
      </LegalSection>

      <LegalSection title="Sharing and retention">
        <p>
          We do not sell your personal information. We may share data with service providers who
          help us run StillHere, or when required by law. We retain information for as long as your
          account or memorial pages exist, unless you request deletion where applicable.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can update account details in settings, manage memorial content you control, and
          contact us to ask questions about your data or request account deletion.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          If you have questions about this Privacy Policy, contact us at{" "}
          <a href="mailto:privacy@stillhere.app">privacy@stillhere.app</a>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
