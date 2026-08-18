import Link from "next/link";
import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "About | TheYonoRummy",
  description:
    "How TheYonoRummy works, how apps get listed, and what we do and don't do as an independent directory.",
  alternates: { canonical: "https://theyonorummy.com/about" },
};

export default function AboutPage() {
  return (
    <LegalPage title="About TheYonoRummy">
      <p>
        TheYonoRummy is a directory of Yono Rummy and other real-money card
        and casino apps for Android, built for users in India.
      </p>
      <p>
        Every app listed here is downloaded and checked before it goes live.
        We note the signup bonus, minimum withdrawal, and other details
        directly from the app, and we update that information whenever an
        app changes.
      </p>
      <p>
        We do not own, build, or operate any of the apps listed on this
        site. TheYonoRummy works as an independent directory. When you
        download an app through a link here, you go directly to that app&apos;s
        own registration process, and that app is responsible for its own
        service, support, and terms.
      </p>
      <p>
        Real-money gaming carries financial risk. Read our{" "}
        <Link href="/responsible-gaming" className="font-semibold text-emerald-600 hover:underline">
          Responsible Gaming
        </Link>{" "}
        page before you download anything, and check whether real-money
        card games are allowed in your state.
      </p>
    </LegalPage>
  );
}
