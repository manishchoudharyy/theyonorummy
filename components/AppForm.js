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

function randomRating() {
  return (3.8 + Math.random() * 0.8).toFixed(1); // 3.8-4.6
}

function randomRatingCount() {
  return 5000 + Math.floor(Math.random() * 45001); // 5000-50000
}

export default function AppForm({ action, initialData, errorMessage }) {
  const isEdit = Boolean(initialData);

  const slugRef = useRef(null);
  const slugTouchedRef = useRef(isEdit);

  const [defaultAppSize] = useState(() => initialData?.appSize || randomAppSize());
  const [defaultDownloads] = useState(() => initialData?.downloads || randomDownloads());
  const [defaultRating] = useState(() => initialData?.rating ?? randomRating());
  const [defaultRatingCount] = useState(
    () => initialData?.ratingCount ?? randomRatingCount()
  );
  const [defaultAppTitle] = useState(() => {
    if (initialData?.appTitle) return initialData.appTitle;
    if (initialData?.name) {
      return `${initialData.name} APK Download — ${initialData.bonus || "₹51"} Bonus`;
    }
    return "";
  });

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
          <div className="sm:col-span-2">
            <Field
              label="App Page Title (shown as the H1 on the app page)"
              name="appTitle"
              defaultValue={defaultAppTitle}
              placeholder="e.g. Max Rummy APK Download — ₹91 Bonus"
              required
            />
          </div>
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
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:col-span-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Upload Logo Image
              <input
                type="file"
                name="logoFile"
                accept="image/*"
                className="text-sm font-normal text-slate-900 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </label>
            <p className="text-[11px] font-normal text-slate-400">
              Saved automatically as <code>/icons/&#123;slug&#125;.ext</code>, replacing any
              existing logo for this app.
              {initialData?.logo && <> Current: <code>{initialData.logo}</code></>}
            </p>
            <Field
              label="Or Logo Path / URL (used only if no file is uploaded above)"
              name="logo"
              defaultValue={initialData?.logo}
              placeholder="/icons/app.webp"
            />
          </div>
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
            defaultValue={defaultRating}
            required
          />
          <Field
            label="Rating Count"
            name="ratingCount"
            type="number"
            min="0"
            defaultValue={defaultRatingCount}
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
