import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "Contact | TheYonoRummy",
  description: "Get in touch with TheYonoRummy for questions, broken links, or listing issues.",
  alternates: { canonical: "https://theyonorummy.com/contact" },
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        If you have a question about an app listed here, spotted a broken
        link, or want to report an issue with a listing, write to us at{" "}
        <a href="mailto:contact@theyonorummy.com" className="font-semibold text-emerald-600 hover:underline">
          contact@theyonorummy.com
        </a>
        .
      </p>
      <p>
        We read every message. Response times can vary, so please allow a
        few days for a reply, especially for less urgent questions.
      </p>
      <p>
        For app-specific issues such as withdrawal delays or account
        problems, contact that app&apos;s own support team directly.
        TheYonoRummy does not operate any of the listed apps and cannot
        access your account or transaction details on any of them.
      </p>
    </LegalPage>
  );
}
