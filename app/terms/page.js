import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "Terms of Use | TheYonoRummy",
  description: "The terms that apply when you use TheYonoRummy.",
  alternates: { canonical: "https://theyonorummy.com/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="18 August 2026">
      <p>By using TheYonoRummy, you agree to the following terms.</p>

      <div>
        <h2>What this site is</h2>
        <p className="mt-1.5">
          TheYonoRummy is an independent directory of real-money rummy,
          slots, and card-game apps for Android. We do not develop, own, or
          operate any of the apps listed here. Each app is a separate
          product from a separate developer, with its own terms and its
          own responsibility for its service.
        </p>
      </div>

      <div>
        <h2>Age and eligibility</h2>
        <p className="mt-1.5">
          This site and the apps listed on it are meant for adults only.
          Real-money card games are restricted or banned in some Indian
          states. It is your responsibility to check whether these games
          are legal where you live before you download or play.
        </p>
      </div>

      <div>
        <h2>No guarantee</h2>
        <p className="mt-1.5">
          We list bonus amounts, minimum withdrawal figures, and other
          details as reported by each app at the time of listing. These
          can change without notice. We do not guarantee any bonus,
          payout, or winning, and we are not responsible for an app&apos;s
          decision to change its terms, delay a withdrawal, or close an
          account.
        </p>
      </div>

      <div>
        <h2>Referral links</h2>
        <p className="mt-1.5">
          Download links on this site are referral links. We may receive
          a benefit when you install an app through them. This does not
          cost you anything extra and does not affect the accuracy of the
          information we show.
        </p>
      </div>

      <div>
        <h2>Changes</h2>
        <p className="mt-1.5">
          We can update, add, or remove any app listing at any time
          without notice. We can also update these terms, and the date
          above will change when we do.
        </p>
      </div>
    </LegalPage>
  );
}
