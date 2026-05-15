# Letterboxd-Extras

A browser add-on/extension that adds additional features to the movie tracking database site [Letterboxd](https://letterboxd.com/) including ratings from other sites, box office and budget, and more.

<a href="https://addons.mozilla.org/firefox/addon/letterboxd-extras/"><img src="https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png" alt="Get Letterboxd Extras for Firefox"></a>
<a href="https://chromewebstore.google.com/detail/letterboxd-extras/edhldpamlnkpekapihiolppcdppgeice"><img src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="Get Letterboxd Extras for Chromium"></a>
<a href="https://microsoftedge.microsoft.com/addons/detail/letterboxd-extras/khnodkkceaakcafenlmnbbjgfkhjmbgh"><img src="https://user-images.githubusercontent.com/585534/107280673-a5ece780-6a26-11eb-9cc7-9fa9f9f81180.png" alt="Get Letterboxd Extras for Microsoft Edge"></a>

**This add-on also supports the mobile Letterboxd website and has been tested to work on Firefox for Android.** Other Android browsers that support add-ons/extensions should work, but have not been tested.

***

* [Features](#features)
* [Installation](#installation)
* [Issues or Suggestions](#issues-or-suggestions)
* [Screenshots](#screenshots)
* [Credits](#credits)

## Features
- Film ratings: displays film ratings from other websites, by default:
  - IMDb
  - Rotten Tomatoes
  - Metacritic
  - MyAnimeList
  - AniList
  - CinemaScore
- Additional film rating sites, disabled by default:
  - SensCritique
  - MUBI
  - FilmAffinity
  - Simkl
  - AlloCiné
  - Filmarks
  - Kinopoisk
- Additional top film rankings: Display the rankings from "They Shoot Pictures, Don't They?" top 1000 and "BFI Sight and Sound" top 250
- Info box on people pages: A Wikipedia-like info box on people pages for the birth dates, death dates, and years active
- MPA film ratings: Display the film's MPA rating 
- Wide release date: Display the full wide release date on hover of the film year
- Duration: Converts the duration to hours and minutes on hover of the duration
- Budget and Box Office: Display budget and box office numbers in the details tabs
- Search: option to default the search to filter to films only


## Installation
### Firefox and Firefox-based Browsers
[Firefox Add-ons](https://addons.mozilla.org/firefox/addon/letterboxd-extras/)

XPI file for manual installation available for each release on the [releases tab](https://github.com/duncanlang/Letterboxd-Extras/releases).

### Chromium Browsers
[Chrome Web Store](https://chromewebstore.google.com/detail/letterboxd-extras/edhldpamlnkpekapihiolppcdppgeice)

[Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/letterboxd-extras/khnodkkceaakcafenlmnbbjgfkhjmbgh)


## Issues or Suggestions
Any issues or suggestions, please [create an issue on Github](https://github.com/duncanlang/Letterboxd-Extras/issues).

Any suggestion for new rating sites will be considered, but may not be possible due to lack of APIs or anti-scraping rules.

## Screenshots
Additional ratings from IMDb, Rotten Tomatoes, Metacritic, and Cinemascore in the sidebar, new links at the bottom, MPA rating at the top
<img src="./screenshots/1.png" alt="Ratings, and MPA rating">

Extra details for Rotten Tomatoes and Metacritic expanded in the sidebar
<img src="./screenshots/2.png" alt="Rotten Tomatoes and Metacritc additional details">

More ratings from SensCritique, MUBI, filmaffinity, and SIMKL, rankings on the left sidebar, and budget and box office in the details tab
<img src="./screenshots/3.png" alt="More ratings and rankings">

More ratings from Allocine
<img src="./screenshots/4.png" alt="Allocine ratings">

MyAnimeList and AniList ratings for Anime
<img src="./screenshots/5.png" alt="MyAnimeList and AniList">

Info box below photo of the actor, displaying the birth and death dates as well as the years active
<img src="./screenshots/6.png" alt="Actor info box">

## Credits
### Contributors
Thanks to these users who have contributed to the development of Letterboxd Extras:

<a href="https://github.com/notune"><img width="30" height="30" src="https://avatars.githubusercontent.com/u/25132780?v=4"></a>
<a href="https://github.com/wei-chen-li"><img width="30" height="30" src="https://avatars.githubusercontent.com/u/37772638?v=4"></a>
<a href="https://github.com/cmhhelgeson"><img width="30" height="30" src="https://avatars.githubusercontent.com/u/62450112?v=4"></a>

[See contribution history](https://github.com/duncanlang/Letterboxd-Extras/graphs/contributors)

### API Usage
Letterboxd Extras makes use of WikiData for data including site IDs, dates, and content ratings.

<a href="https://www.wikidata.org/"><img width="200" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Wikidata_Stamp_Rec_Light.svg/1920px-Wikidata_Stamp_Rec_Light.svg.png?_=20220731133131" alt="Powered by WikiData"></a>

Letterboxd Extras also makes use of official and unofficial APIs for various functionality:
- [AniList API](https://docs.anilist.co/) official API
- [Simkl API](https://simkl.docs.apiary.io/#) official API
- [Does the Dog Die?](https://www.doesthedogdie.com/) official API
- [Jikan API](https://jikan.moe/) unofficial API for MyAnimeList
- [Markuapi](https://github.com/e0406370/markuapi) unofficial API for Filmarks 
- [Kinopoisk Unofficial API](https://kinopoiskapiunofficial.tech/) for Kinopoisk






