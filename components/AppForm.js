"use client";

import { forwardRef, useRef, useState } from "react";
import RichTextEditor from "./RichTextEditor";

const Field = forwardRef(function Field({ label, ...props }, ref) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
      {label}
      <input
        ref={ref}
        {...props}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
});

function TextArea({ label, rows = 4, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
      {label}
      <textarea
        {...props}
        rows={rows}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-slate-300" />
      {label}
    </label>
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomAppSize() {
  const size = 42 + Math.floor(Math.random() * 6); // 42-47
  return `${size}MB`;
}

function randomDownloads() {
  const count = 10 + Math.floor(Math.random() * 491); // 10-500
  return `${count}K+`;
}

export default function AppForm({ action, initialData, errorMessage }) {
  const isEdit = Boolean(initialData);

  const [faqs, setFaqs] = useState(
    initialData?.faq?.length ? initialData.faq : [{ question: "", answer: "" }]
  );

  const slugRef = useRef(null);
  const slugTouchedRef = useRef(isEdit);

  const [defaultAppSize] = useState(() => initialData?.appSize || randomAppSize());
  const [defaultDownloads] = useState(() => initialData?.downloads || randomDownloads());

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));

  const handleNameChange = (e) => {
    if (slugTouchedRef.current || !slugRef.current) return;
    slugRef.current.value = slugify(e.target.value);
  };

  return (
    <form action={action} className="flex flex-col gap-6">
      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {/* Basic Info */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">Basic Info</legend>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="App Name"
            name="name"
            defaultValue={initialData?.name}
            onChange={handleNameChange}
            required
          />
          <Field
            ref={slugRef}
            label="Slug"
            name="slug"
            defaultValue={initialData?.slug}
            onChange={() => {
              slugTouchedRef.current = true;
            }}
            required
          />
          <Field
            label="Logo (path or URL, e.g. /icons/app.webp)"
            name="logo"
            defaultValue={initialData?.logo}
            required
          />
          <Field
            label="Categories (comma-separated)"
            name="categories"
            defaultValue={initialData?.categories?.join(", ")}
            placeholder="rummy, slots"
          />
          <Field label="Bonus" name="bonus" defaultValue={initialData?.bonus || "₹51"} />
          <Field
            label="Min Withdraw (₹)"
            name="minWithdraw"
            type="number"
            defaultValue={initialData?.minWithdraw ?? 100}
          />
          <Field
            label="App Size"
            name="appSize"
            defaultValue={defaultAppSize}
            placeholder="42MB"
            required
          />
          <Field
            label="Version"
            name="version"
            defaultValue={initialData?.version || "1.0.0"}
            placeholder="1.0.0"
          />
          <Field
            label="Rating (0-5)"
            name="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            defaultValue={initialData?.rating}
            required
          />
          <Field
            label="Downloads"
            name="downloads"
            defaultValue={defaultDownloads}
            placeholder="86K+"
            required
          />
          <div className="sm:col-span-2">
            <Field
              label="Refer Link"
              name="referLink"
              defaultValue={initialData?.referLink}
              required
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <Checkbox label="New" name="isNewApp" defaultChecked={initialData?.isNewApp} />
          <Checkbox
            label="Trending"
            name="isTrending"
            defaultChecked={initialData?.isTrending}
          />
          <Checkbox
            label="Active"
            name="isActive"
            defaultChecked={initialData?.isActive ?? true}
          />
        </div>
      </fieldset>

      {/* Content */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">Content</legend>
        <div className="mt-2 flex flex-col gap-3">
          <RichTextEditor
            label="Description"
            name="description"
            defaultValue={initialData?.content?.description}
          />
          <TextArea
            label="Why Choose"
            name="whyChoose"
            defaultValue={initialData?.content?.whyChoose}
          />
          <TextArea
            label="How To Download"
            name="howToDownload"
            defaultValue={initialData?.content?.howToDownload}
          />
          <TextArea
            label="Additional Info"
            name="additionalInfo"
            defaultValue={initialData?.content?.additionalInfo}
          />
        </div>
      </fieldset>

      {/* FAQ */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">FAQ</legend>
        <div className="mt-2 flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-slate-100 p-3">
              <Field
                label={`Question ${i + 1}`}
                name="faqQuestion"
                defaultValue={faq.question}
              />
              <div className="mt-2">
                <TextArea
                  label={`Answer ${i + 1}`}
                  name="faqAnswer"
                  defaultValue={faq.answer}
                  rows={2}
                />
              </div>
              {faqs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFaq}
            className="w-fit rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            + Add FAQ
          </button>
        </div>
      </fieldset>

      {/* SEO */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">SEO</legend>
        <div className="mt-2 flex flex-col gap-3">
          <Field
            label="Meta Title"
            name="metaTitle"
            defaultValue={initialData?.seo?.metaTitle}
          />
          <TextArea
            label="Meta Description"
            name="metaDescription"
            defaultValue={initialData?.seo?.metaDescription}
            rows={2}
          />
          <Field
            label="Keywords (comma-separated)"
            name="keywords"
            defaultValue={initialData?.seo?.keywords?.join(", ")}
          />
        </div>
      </fieldset>

      <button
        type="submit"
        className="h-12 rounded-xl bg-emerald-500 text-sm font-bold text-white hover:bg-emerald-600"
      >
        {initialData ? "Update App" : "Create App"}
      </button>
    </form>
  );
}
