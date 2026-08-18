import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "Responsible Gaming | TheYonoRummy",
  description:
    "Guidance on playing real-money card and casino games within your limits, plus where to get support.",
  alternates: { canonical: "https://theyonorummy.com/responsible-gaming" },
};

const bannedStates = [
  "Andhra Pradesh",
  "Sikkim",
  "Nagaland",
  "Assam",
  "Arunachal Pradesh",
  "Tamil Nadu",
  "Odisha",
  "Telangana",
];

export default function ResponsibleGamingPage() {
  return (
    <LegalPage title="Responsible Gaming">
      <p>
        Real-money card and casino games involve financial risk. This page
        is here to help you play within your limits.
      </p>

      <div>
        <h2>Set a limit before you start</h2>
        <p className="mt-1.5">
          Decide how much you are willing to spend before you open an app,
          and stop when you reach it. Do not treat these games as a source
          of income.
        </p>
      </div>

      <div>
        <h2>Do not chase losses</h2>
        <p className="mt-1.5">
          If you lose money, do not try to win it back by playing more or
          increasing your stakes. This is one of the most common ways
          people lose more than they intended.
        </p>
      </div>

      <div>
        <h2>Watch for warning signs</h2>
        <p className="mt-1.5">
          Playing longer than planned, borrowing money to play, hiding how
          much you play from family, or feeling anxious when you are not
          playing are signs worth paying attention to.
        </p>
      </div>

      <div>
        <h2>Check your state's rules</h2>
        <p className="mt-1.5">
          Real-money card games are restricted or banned by the government
          in: <strong>{bannedStates.join(", ")}</strong>. Confirm your
          local rules before downloading or playing.
        </p>
      </div>

      <div>
        <h2>If you need support</h2>
        <p className="mt-1.5">
          KIRAN, the national mental health helpline run by India's
          Ministry of Social Justice and Empowerment, is free and
          available at{" "}
          <a href="tel:18005990019" className="font-semibold text-emerald-600 hover:underline">
            1800-599-0019
          </a>
          , any time of day.
        </p>
      </div>

      <p>
        TheYonoRummy does not operate any of the listed apps and cannot
        pause, close, or set limits on an account for you. Contact the app
        directly for account-level controls, if it offers them.
      </p>
    </LegalPage>
  );
}
