import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const documents = {
  privacy: {
    badge: "LOGIXIA · PRIVACY POLICY",
    title: "Privacy Policy",
    introduction: "How information is used when you learn with Logixia.",
    isDraft: true,
    sections: [
      {
        title: "Account and learning information",
        text: "Logixia uses the information you provide when creating an account, including your name, username and email, to identify your account and provide learning features. Course participation, cohort membership, submitted work and assessment results support your learning experience.",
      },
      {
        title: "Information visible to instructors",
        text: "Cohort management is designed to show instructors member usernames, email addresses, roles, payment status and learning XP. Invitations are associated with the email address supplied by the instructor.",
      },
      {
        title: "Cookies and browser storage",
        text: "Authentication uses cookies to maintain your session. Browser storage saves preferences such as your theme and sidebar layout, and may store playground code on your device. Clearing browser storage can remove locally saved work and preferences.",
      },
      {
        title: "We do not sell your data",
        text: "Logixia does not sell your personal data.",
      },
      {
        title: "Contact",
        text: "For privacy questions or requests concerning your personal information, email support@logixia.com.ng.",
      },
      {
        title: "Your code and submissions",
        text: "Work submitted for assessment may be sent to the backend for processing and testing. Avoid including passwords, access keys or other confidential information in code or submissions.",
      },
      {
        title: "Before this policy is finalised",
        text: "The service operator, hosting and processing providers, retention periods, applicable privacy rights and request process still need to be confirmed. This draft does not make promises about those details.",
      },
    ],
  },
  terms: {
    badge: "LOGIXIA · TERMS & CONDITIONS",
    title: "Terms and Conditions",
    introduction:
      "Effective November 13, 2026. These Terms and Conditions govern your access to and use of Logixia, including our courses, live cohorts, coding workspaces, daily challenges, and arcade learning tools.",
    isDraft: false,
    sections: [
      {
        title: "1. Acceptance of Terms",
        text: "By creating an account, enrolling in a cohort, or using any part of the Logixia platform, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you are using Logixia on behalf of an organization or school, you represent that you have authority to accept these terms on its behalf.",
      },
      {
        title: "2. Accounts and Eligibility",
        text: "You must provide accurate, complete registration details and keep your account credentials confidential. You are responsible for all activity that occurs under your account. Do not share your login credentials, impersonate another person, or use cohort invitation links intended for someone else.",
      },
      {
        title: "3. Acceptable Use and Platform Integrity",
        text: "You agree to use Logixia solely for lawful educational purposes. You must not harass, abuse, or disrupt instructors or fellow learners; attempt to bypass authentication, sandboxing, or access controls; probe or overload our servers or browser execution environments; or submit malicious code designed to harm systems or other users.",
      },
      {
        title: "4. Courses, Cohorts, and Payments",
        text: "Cohort schedules, curricula, pricing, and seat availability are displayed on each offering page before enrollment. Paid cohorts grant access for the stated cohort duration and any included course materials. All fees are due at enrollment unless otherwise stated in writing.",
      },
      {
        title: "5. Cohort Refund Policy",
        text: "You may request a full refund of your cohort enrollment fee within seven (7) calendar days from the cohort’s advertised start date, even if you have attended live sessions during that period. To request a refund, email support@logixia.com.ng with your account email, cohort name, and payment reference. Approved refunds are processed back to the original payment method according to standard payment provider timelines.",
      },
      {
        title: "6. Intellectual Property and Learner Submissions",
        text: "All Logixia course content, exercises, challenges, branding, and software remain the property of Logixia and its instructors. You may use learning materials for your personal study only and may not redistribute, resell, or publish them without permission. You retain ownership of the original code you write, while granting Logixia a limited license to execute, test, display, and store your submissions to deliver grading, live classroom features, and progress tracking.",
      },
      {
        title: "7. Live Classrooms and Recordings",
        text: "Live cohort sessions may include real-time code collaboration, audio, chat, and session recordings made available to enrolled cohort members. By participating in live sessions, you agree to follow instructor guidelines and refrain from recording or redistributing sessions outside the platform without prior consent.",
      },
      {
        title: "8. Suspension and Termination",
        text: "Logixia reserves the right to suspend or terminate accounts that violate these Terms and Conditions, compromise platform security, or engage in abusive conduct. You may stop using the platform or request account closure at any time by contacting support@logixia.com.ng.",
      },
      {
        title: "9. Disclaimers and Limitation of Liability",
        text: "Logixia is provided on an “as is” and “as available” basis. While we strive for reliable uptime and accurate educational content, we do not guarantee uninterrupted access, error-free code execution, or specific career or academic outcomes. To the maximum extent permitted by law, Logixia is not liable for indirect, incidental, or consequential damages arising from your use of the service.",
      },
      {
        title: "10. Updates and Contact",
        text: "We may update these Terms and Conditions from time to time. Continued use of Logixia after updated terms are posted constitutes acceptance of the revised terms. For questions about these Terms, billing, or your account, contact support@logixia.com.ng.",
      },
    ],
  },
};

export function LegalPage({ document }: { document: keyof typeof documents }) {
  const content = documents[document];
  return (
    <article className="mx-auto max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>
      <p className="mt-8 text-xs font-semibold tracking-[0.18em] text-accent">
        {content.badge}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        {content.title}
      </h1>
      <p className="mt-5 text-lg leading-8 text-muted">
        {content.introduction}
      </p>
      {content.isDraft && (
        <div className="mt-8 rounded-lg border border-line bg-surface p-4 text-sm leading-6 text-muted">
          This document is being prepared. Operational and legal details must be
          confirmed before it is treated as a final policy.
        </div>
      )}
      <div className="mt-10 space-y-9">
        {content.sections.map(({ title, text }) => (
          <section key={title}>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-body">{text}</p>
          </section>
        ))}
      </div>
      <div className="mt-12 border-t border-line pt-6">
        <Link
          to={document === "privacy" ? "/terms" : "/privacy"}
          className="text-sm font-medium text-accent hover:underline"
        >
          {document === "privacy"
            ? "Read Terms and Conditions"
            : "Read Privacy Policy"}{" "}
          →
        </Link>
      </div>
    </article>
  );
}
