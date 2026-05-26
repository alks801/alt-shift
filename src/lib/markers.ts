import { complex, simple, byKey } from "marker-tree";

const header = complex({
  logo: simple,
  goalStatus: simple,
  homeLink: simple,
});

const letterCard = complex({
  body: simple,
  deleteButton: simple,
  copyButton: simple,
});

const letterGrid = complex({
  cards: byKey(letterCard),
});

const emptyState = complex({
  cta: simple,
});

const goalBanner = complex({
  title: simple,
  subtitle: simple,
  cta: simple,
  progress: simple,
});

const dashboard = complex({
  title: simple,
  createNew: simple,
  emptyState,
  letterGrid,
  goalBanner,
});

const letterForm = complex({
  jobTitle: simple,
  company: simple,
  strengths: simple,
  details: simple,
  submit: simple,
});

const letterPreview = complex({
  body: simple,
  loading: simple,
  error: simple,
  copyButton: simple,
  placeholder: simple,
});

const newLetter = complex({
  title: simple,
  form: letterForm,
  preview: letterPreview,
  goalBanner,
});

const confirmDialog = complex({
  title: simple,
  description: simple,
  confirm: simple,
  cancel: simple,
});

const rootSchema = complex({
  header,
  dashboard,
  newLetter,
  confirmDialog,
});

export const markers = rootSchema("app");
