# arcana highlights & why?

> **heads up:** this is a self playing book (automatically) that runs for about **8 minutes**, with sound on. it turns its own pages, so you can just sit back and prolly grab a drink, turn your volume up, and use a bigger screen for the best view :D

honestly, there's no grand problem im trying to solve here, arcana highlights is an incredibly personal project!! it's a collection of memories from my first international trip, my time at hack club hackathon in singapore, the people i met, the places i visited, and all the little moments in between. a lot of people have asked me about the trip and i wanted to make something that would let me share the experience with them!

but there's also a more personal reason which is that i wanted something i could come back to years from now, something i could revisit whenever i miss singapore, the people, or that particular chapter of my life and a boring collage wont bring this feeling back - it can be considered as a short film presented through a digital scrapbook because it uses animations, sound recordings, photographs, and little interactions to tell a story that means a lot to me

i dont particularly intend for this to become a product, nor do i think everything we make needs to have a practical application or solve an existing problem. sometimes, you just want to make something because you care about it. because an experience meant so much to you that putting it into words or showing someone a folder of photographs doesn't quite feel like enough so here it is!

## a peek inside

<table>
  <tr>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820447/first_page_for_arcana_highlights.jpg" width="160" height="100" alt="1st page"></td>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820448/page_2_ch2_completed.jpg" width="160" height="100" alt="layover in doha"></td>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820447/3rd_pg_left_and_right_both_completed.jpg" width="160" height="100" alt="night slideshow"></td>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820447/pg_4_fixed_-_arcana_highlights.jpg" width="160" height="100" alt="day one"></td>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820446/pg_5_-_arcana_highlights.jpg" width="160" height="100" alt="polaroids"></td>
  </tr>
  <tr>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820447/pg_6_-_arcana_highlights.jpg" width="160" height="100" alt="the envelope"></td>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820448/pg_7_-_arcana_highlights.jpg" width="160" height="100" alt="stamps and notes"></td>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820446/pg_8_-_arcana_highlights.jpg" width="160" height="100" alt="universal studios"></td>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820447/pg_9_-_arcana_highlights.jpg" width="160" height="100" alt="going home"></td>
    <td><img src="https://res.cloudinary.com/rnrpiqkl/image/upload/v1795820462/leave_a_comment_-_arcana_highlights.jpg" width="160" height="100" alt="leave your comment!"></td>
  </tr>
</table>


## the building process + main tech stack

this has also been a pretty fun learning experience technically. i'm using typescript, sass and gsap, and figuring out how to make them work together

sass is new territory for me, and this is my first proper project using it. i wasn't sure how i'd feel about it initially, but ive actually started enjoying it quite a bit. gsap, on the other hand, is something i've worked with before. ive been using it for the page turns, zooming, transitions and little subtitle animations. there's been a LOT of trial and error, especially with getting everything to work together!

#### a few things im particularly happy with:

the book uses individual leaves with a front and back, which flip to create each spread. gsap handles the camera movements and zooming through separate timelines for each spread

the voiceovers play in sequence, with subtitles organised by spread in `src/subs.txt`. spread 9 also uses individual timestamps to sync subtitles with the narration

for spread 7, notes are positioned around their photos based on available space, spread 8 uses animated clipping and fading sepia filters to recreate a little photo developing effect (since i wanted to have game boy camera style theme!)

also for smaller screen it first alerts you that the experience might not be as fun as it i'd be on abigger screen but lets you continue anyway because it still works

## ai declaration!

i used claude while building some parts of this, especially took help with popup and implementing subtitles for voiceovers when they were not syncing correctly, barcode for ticket, and for finding bugs in both sass and typescript code and also fixing them, e.g, photos hidden behind a backdrop, an extra gap at the sides of the subtitle, and on spread 7 when i was just able to place subtitles of each photos outside of book but there was a huge gap so used it as well to reduce it and place each note beside its photo without covering another!

## credits!

- photos and videos: me and my friends from the trip, thanks everyone!
- background music: "super trouper" by ABBA and "end of beginning" by Djo (not mine, used only for this personal showcase)
- font: [datbox](https://www.dafont.com/datbox.font)
- book pages background: [crissxcross](https://www.transparenttextures.com/patterns/crissxcross.png) from transparenttextures.com
- animation: [gsap](https://gsap.com)
- photo and video hosting: [cloudinary](https://cloudinary.com)
- guestbook email: [emailjs](https://www.emailjs.com) to receive comments directly in my inbox!

## known limits + might add later
 
it's built for a landscape screen. on small phones it falls back to a smaller book and bottom subtitles, but it's best on a laptop! also i might add "you're currently on x spread" with a timeline and a dashboard of everyone's comments at the end!
 