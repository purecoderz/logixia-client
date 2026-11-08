import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const documents = {
  privacy: {
    title: "Privacy Policy",
    introduction: "How information is used when you learn with Logixia.",
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
    title: "Terms of Use",
    introduction: "Guidelines for using Logixia and its learning tools.",
    sections: [
      {
        title: "Using your account",
        text: "Use accurate account information and keep your sign-in credentials private. Do not use another person’s account or share invitation links intended for someone else.",
      },
      {
        title: "Learning responsibly",
        text: "Use the platform respectfully. Do not harass other learners, attempt to access information without permission, disrupt the service or submit code intended to harm systems or other users.",
      },
      {
        title: "Courses, cohorts and payments",
        text: "Review the course or cohort details before enrolling. Availability, dates, pricing and access may differ between offerings. Review the cohort refund section for the refund window. Other payment and cancellation details still need to be confirmed.",
      },
      {
        title: "Code and learning materials",
        text: "Only upload or share content you have permission to use. Respect the rights of instructors and other learners when using or distributing learning materials.",
      },
      {
        title: "Cohort refunds",
        text: "You may request a full refund of your cohort payment within the first seven days from the cohort’s advertised start date, including after attending classes during that period. This gives you time to decide whether the cohort is right for you. Email support@logixia.com.ng with your cohort name and payment reference to request a refund. This is the request window, not a promise that repayment will be completed within seven days.",
      },
      {
        title: "Contact",
        text: "For account, enrolment or support questions, email support@logixia.com.ng.",
      },
      {
        title: "Before these terms are finalised",
        text: "The service operator, contact details, eligibility requirements, content permissions, remaining payment terms, refund processing details, account closure rules and applicable legal terms still need to be confirmed. This is a draft for review, not a completed agreement.",
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
        LOGIXIA · DRAFT FOR REVIEW
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        {content.title}
      </h1>
      <p className="mt-5 text-lg leading-8 text-muted">
        {content.introduction}
      </p>
      <div className="mt-8 rounded-lg border border-line bg-surface p-4 text-sm leading-6 text-muted">
        This document is being prepared. Operational and legal details must be
        confirmed before it is treated as a final policy.
      </div>
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
          {document === "privacy" ? "Read Terms of Use" : "Read Privacy Policy"}{" "}
          →
        </Link>
      </div>
    </article>
  );
}
