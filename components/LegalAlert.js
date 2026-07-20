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

export default function LegalAlert() {
  return (
    <section className="border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-2.5">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="mt-0.5 h-5 w-5 shrink-0 fill-amber-500"
        >
          <path d="M10 1.5a1 1 0 01.894.553l8 16A1 1 0 0118 19.5H2a1 1 0 01-.894-1.447l8-16A1 1 0 0110 1.5zm0 5.5a.75.75 0 00-.75.75v4a.75.75 0 001.5 0v-4A.75.75 0 0010 7zm0 7.75a.9.9 0 100 1.8.9.9 0 000-1.8z" />
        </svg>
        <div>
          <h2 className="text-sm font-bold text-amber-800">
            Important Legal Alert
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-amber-700">
            Rummy is not legal everywhere. It is banned by the government in:{" "}
            <strong className="font-semibold">
              {bannedStates.join(", ")}
            </strong>
            . If you live in these states, you should not download or play
            rummy apps.
          </p>
        </div>
      </div>
    </section>
  );
}
