"use client"

import { LegalPageLayout, LegalSection } from "@/components/app/LegalPageLayout"

export function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <LegalSection title="Agreement">
        <p>
          By using StillHere, you agree to these Terms of Service. If you do not agree, please do
          not use the service.
        </p>
      </LegalSection>

      <LegalSection title="The service">
        <p>
          StillHere provides tools to create, host, and share digital memorial pages, including
          photos, stories, tributes, and guestbook messages.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          You are responsible for keeping your login credentials secure and for activity that occurs
          under your account. You must provide accurate account information.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          You retain ownership of content you upload or create. You grant StillHere permission to
          host, display, and share that content as needed to operate the memorial pages you publish.
          You confirm you have the right to post the content you add.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Use StillHere for unlawful, harmful, or abusive purposes.</li>
          <li>Post content that infringes someone else&apos;s rights or privacy.</li>
          <li>Attempt to disrupt, scrape, or compromise the platform.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <p>
          We may update, suspend, or discontinue parts of the service. We may revise these terms
          from time to time. Continued use after changes means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer">
        <p>
          StillHere is provided on an &quot;as is&quot; basis to the extent permitted by law. We do
          not guarantee uninterrupted availability of memorial pages or third-party links.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:legal@stillhere.app">legal@stillhere.app</a>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
