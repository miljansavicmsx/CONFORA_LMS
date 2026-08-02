import type { CourseOutline } from "@/types/course-player";

/** Demo outline za Course Player (kasnije API). */
export const MOCK_COURSE_OUTLINE: CourseOutline = {
  courseId: "demo-iso27001",
  title: "ISO 27001 — demo player",
  modules: [
    {
      id: "mod-1",
      title: "Uvod u ISMS",
      order: 1,
      lessons: [
        {
          id: "les-1-1",
          title: "Što je informacijska sigurnost",
          contentType: "video",
          durationMinutes: 12,
          contentUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          thumbnailUrl: "",
          chapters: [
            { timeSeconds: 0, title: "Uvod" },
            { timeSeconds: 5, title: "Pojam sigurnosti" },
            { timeSeconds: 15, title: "Primjer snimke" },
          ],
        },
        {
          id: "les-1-2",
          title: "Pregled standarda PDF",
          contentType: "pdf",
          durationMinutes: 8,
          contentUrl:
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        },
        {
          id: "les-1-3",
          title: "Pojmovnik",
          contentType: "text",
          durationMinutes: 6,
          htmlBody: `
<p>ISMS (<strong>Information Security Management System</strong>) je skup pravila i kontrola za zaštitu informacija.</p>
<div class="cf-callout cf-callout-info"><span class="cf-callout-title">Info</span><p>CIA triada (povjerljivost, integritet, dostupnost) često je polazište za procjenu rizika.</p></div>
<ul><li>Povjerljivost</li><li>Integritet</li><li>Dostupnost</li></ul>
<div class="cf-callout cf-callout-warning"><span class="cf-callout-title">Upozorenje</span><p>Bez dokumentiranih kontrola, audit može označiti neusklađenost.</p></div>
<div class="cf-callout cf-callout-important"><span class="cf-callout-title">Važno</span><p>Politika informacijske sigurnosti mora biti odobrena na vrhu organizacije.</p></div>
`.trim(),
        },
      ],
    },
    {
      id: "mod-2",
      title: "Rizici i kontrole",
      order: 2,
      lessons: [
        {
          id: "les-2-1",
          title: "Procjena rizika",
          contentType: "video",
          durationMinutes: 18,
          contentUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        },
        {
          id: "les-2-2",
          title: "Kviz znanja",
          contentType: "quiz",
          durationMinutes: 10,
        },
      ],
    },
  ],
};
