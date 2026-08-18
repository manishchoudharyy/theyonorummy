import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "Privacy Policy | TheYonoRummy",
  description: "What information TheYonoRummy collects, and what it doesn't.",
  alternates: { canonical: "https://theyonorummy.com/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="18 August 2026">
      <p>
        TheYonoRummy does not require an account, and we do not collect
        your name, phone number, or email address just by browsing this
        site.
      </p>
      <p>
        When you visit any page, our server records standard technical
        information such as your IP address, browser type, and the page
        you requested. This is normal web server behavior and is used only
        to keep the site running and secure.
      </p>
      <p>
        When you tap Download on an app listed here, you are redirected to
        that app&apos;s own registration page through a referral link. That
        link tells the app you came from TheYonoRummy. Once you reach the
        app itself, that app&apos;s own privacy policy applies to any
        information you give it, including your mobile number and OTP. We
        do not receive or store that information.
      </p>
      <p>
        This site does not use cookies to track visitors and does not run
        third-party advertising or analytics scripts.
      </p>
      <p>
        If we change how this site handles data, we will update this page
        and change the date above.
      </p>
    </LegalPage>
  );
}
