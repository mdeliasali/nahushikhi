## ব্যবহারের নির্দেশ


1. PROMPT ১ অনুযায়ী → পেজ তৈরি করো
2. PROMPT ২ অনুযায়ী → পেজ তৈরি করো
3. PROMPT ৩ অনুযায়ী → পেজ তৈরি করো
4. PROMPT ৪ অনুযায়ী → navigation আপডেট করো
5. GitHub-এ push করো

## PROMPT 1: অনুবাদ প্র্যাকটিস পেজ (TranslationPage)

Create a new page at `/translation` called **অনুবাদ প্র্যাকটিস** for the Nahu Shikhi Arabic grammar app.

### Requirements:
- Two modes: **আরবি → বাংলা** and **বাংলা → আরবি** (toggle buttons at top)
- Show one sentence at a time with a progress bar
- User types their translation in a textarea
- "উত্তর দেখো" button reveals the correct answer
- After seeing answer, user self-grades: ✓ সঠিক / ✗ ভুল
- Show running score (correct/wrong count) in the header
- "পরবর্তী" button to go to next sentence
- "রিস্টার্ট" button to reset

### Sample data to include (Arabic → Bengali):
1. دَخَلَتْ عَائِشَةُ فِي الْمَكْتَبَةِ → আয়েশা পাঠাগারে প্রবেশ করল
2. الْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ → লজ্জা ঈমানের একটি শাখা
3. اِرْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ → জমিনে যারা আছে তাদের দয়া করো, আসমানে যিনি আছেন তিনি তোমাদের দয়া করবেন
4. عَدُوٌّ عَاقِلٌ خَيْرٌ مِنْ صَدِيقٍ جَاهِلٍ → জ্ঞানী শত্রু মূর্খ বন্ধুর চেয়ে উত্তম
5. اَلْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ → মায়েদের পায়ের নিচে জান্নাত
6. الْعِلْمُ نُورٌ وَالْجَهْلُ ظُلْمَةٌ → জ্ঞান আলো এবং মূর্খতা অন্ধকার
7. طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ → জ্ঞান অর্জন প্রতিটি মুসলমানের উপর ফরজ
8. الْوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ → সময় তরবারির মতো, না কাটলে সে তোমাকে কেটে ফেলবে

### Sample data (Bengali → Arabic):
1. ইমরান জুমার দিন রোজা রেখেছে → صَامَ عِمْرَانُ يَوْمَ الْجُمُعَةِ
2. যেমন কর্ম তেমন ফল → كَمَا تَزْرَعُ تَحْصُدُ
3. দয়া করে যে, দয়া পায় সে → مَنْ رَحِمَ رُحِمَ
4. পুণ্য পাপকে মুছে ফেলে → الْحَسَنَاتُ يُذْهِبْنَ السَّيِّئَاتِ
5. জ্ঞানী ব্যক্তি আল্লাহর বন্ধু → اَلْعَالِمُ وَلِيُّ اللهِ
6. আল্লাহ যাকে ইচ্ছা হেদায়াত দান করেন → اَللهُ يَهْدِي مَنْ يَشَاءُ
7. মায়ের পায়ের নিচে জান্নাত → اَلْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ

### Design:
- Header color: violet/purple theme (bg-violet-50)
- Arabic text: dir="rtl", large font, leading-loose
- Match existing app design style (glass-card, rounded-2xl, shadcn/ui components)

---

## PROMPT 2: তাশকিল ও বাক্য সংশোধন পেজ (TashkilPage)

Create a new page at `/tashkil` called **তাশকিল ও সংশোধন** for the Nahu Shikhi app.

### Two tabs:
**Tab 1: বাক্য সংশোধন**
- Show a wrong Arabic sentence in red box
- User writes the corrected sentence
- Reveal button shows: correct sentence + the grammar rule broken
- Self-grade buttons

### Correction questions (from Dakhil 2025 board exam):
1. Wrong: كَانَ عُثْمَانُ (رض) غَنِي → Correct: كَانَ عُثْمَانُ (رض) غَنِيًّا | Rule: كان এর খবর মানসুব হয়
2. Wrong: ذَهَبَ خَالِدٌ إِلَى الْمَدْرَسَة → Correct: ذَهَبَ خَالِدٌ إِلَى الْمَدْرَسَةِ | Rule: হরফে জার-এর পর মাজরুর
3. Wrong: إِنَّ اللهَ خَالِقًا → Correct: إِنَّ اللهَ خَالِقٌ | Rule: إن এর খবর মারফু
4. Wrong: هَذَا هِيَ أَخُوكَ → Correct: هَذَا هُوَ أَخُوكَ | Rule: মুযাক্কারের দামির هو
5. Wrong: قَرَأْتُ عِشْرُونَ كِتَابًا → Correct: قَرَأْتُ عِشْرِينَ كِتَابًا | Rule: মানসুব অবস্থায় عشرين

**Tab 2: শকল (হরকত)**
- Show Arabic sentence WITHOUT harakat
- Show Bengali translation as hint
- "উত্তর দেখো" reveals full tashkil + word-by-word iraab breakdown table

### Tashkil questions:
1. الظلم مرتعه وخيم → اَلظُّلْمُ مَرْتَعُهُ وَخِيمٌ (অত্যাচারের পরিণতি ভয়াবহ)
2. المؤمن بشره في وجهه → اَلْمُؤْمِنُ بِشْرُهُ فِي وَجْهِهِ (মুমিনের হাসি তার মুখে)
3. قراءة القران تزيد الايمان → قِرَاءَةُ الْقُرْآنِ تَزِيدُ الْإِيمَانَ (কুরআন তিলাওয়াত ঈমান বৃদ্ধি করে)
4. الطالب يلعب في البيت → اَلطَّالِبُ يَلْعَبُ فِي الْبَيْتِ (ছাত্রটি ঘরে খেলছে)
5. الطامع في وثاق الذل → اَلطَّامِعُ فِي وَثَاقِ الذُّلِّ (লোভী ব্যক্তি লাঞ্ছনার শৃঙ্খলে)

### Design:
- Header color: amber/yellow theme (bg-amber-50)
- Iraab breakdown as a table: word | role | haraka
- Match existing app design

---

## PROMPT 3: ইনশা ও রচনা পেজ (InshaPage)

Create a new page at `/insha` called **ইনশা ও রচনা** for the Nahu Shikhi app.

### Three tabs:

**Tab 1: দরখাস্ত (Application)**
- Show full Arabic application text for "৩ দিনের ছুটির দরখাস্ত"
- Toggle button to show/hide Bengali meaning
- Copy to clipboard button
- Key phrases section (Arabic + Bengali side by side)

**Tab 2: চিঠি (Letter)**
- Show full Arabic letter to brother asking for 1000 taka for books
- Same toggle + copy functionality
- Key phrases section

**Tab 3: রচনা (Essay)**
- 3 essay selector buttons: সময়ের মূল্য | ইলমের ফযিলত | মাদ্রাসা
- Show full Arabic essay text
- Copy button
- "মুখস্থ করার বাক্য" section — 3 key sentences with Bengali meaning

### Darkhast Arabic text:
إِلَى مُدِيرِ الْمَدْرَسَةِ
الْمَوْضُوعُ: طَلَبُ الْإِجَازَةِ لِثَلَاثَةِ أَيَّامٍ
أَيُّهَا الْمُدِيرُ الْمُحْتَرَمُ،
أَرْفَعُ إِلَى حَضْرَتِكُمُ الْكَرِيمَةِ أَنِّي طَالِبٌ فِي الصَّفِّ الْعَاشِرِ.
وَالسَّبَبُ أَنَّنِي مَرِيضٌ وَلَا أَسْتَطِيعُ حُضُورَ الدِّرَاسَةِ.
فَأَرْجُو مِنْكُمْ مَنْحِي إِجَازَةً لِمُدَّةِ ثَلَاثَةِ أَيَّامٍ.
وَلَكُمْ جَزِيلُ الشُّكْرِ.
الْمُخْلِصُ، ....................

### Design:
- Header color: emerald/green theme (bg-emerald-50)
- Arabic text: large, dir="rtl", leading-loose
- Copy button top-left of text card
- Match existing app design

---

## PROMPT 4: Navigation আপডেট

Update **BottomNav.tsx** and **SideNav.tsx** to include the 3 new pages.

### BottomNav — add these items:
- Languages icon → label "অনুবাদ" → path "/translation"
- PenLine icon → label "তাশকিল" → path "/tashkil"
- FileText icon → label "ইনশা" → path "/insha"

### SideNav — reorganize into groups:
**Group 1 — প্রধান:** হোম, প্রোফাইল
**Group 2 — পরীক্ষার প্রস্তুতি:** প্রশ্নব্যাংক, সংক্ষিপ্ত প্রশ্ন, মক টেস্ট, রিভিশন কার্ড
**Group 3 — বিশেষ অনুশীলন:** অনুবাদ প্র্যাকটিস, তাশকিল ও সংশোধন, ইনশা ও রচনা, তারকিব বিশ্লেষণ

### App.tsx — add 3 new routes:
- /translation → TranslationPage
- /tashkil → TashkilPage
- /insha → InshaPage

Import the 3 new page components at the top of App.tsx.

---

