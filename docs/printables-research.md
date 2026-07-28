# Printable PDF product research

Research date: 2026-07-25  
Primary market: United States  
Sources: Semrush exports in `docs/keywords/` and public Etsy search/listing pages.

## Product decisions

| Product | Price | Primary demand signal | Marketplace signal |
| --- | ---: | --- | --- |
| Free Printable Starter Pack | Free | “spot the difference printable” 880 searches/month; “free printable spot the difference” 140/month | Low-friction single sheets and samples are common entry products |
| Preschool Animal Adventures | $3.49 | “spot the difference for kids” 390/month; preschool keyword family 20-30/month | Preschool worksheets, sea animals, and farm-animal packs show repeated review activity |
| Classroom Seasons Bundle | $5.99 | “spot the difference worksheets” 480/month at keyword difficulty 2 | Seasonal/holiday packs and classroom worksheets are among the most-reviewed visible listings |
| Adult Hard Visual Challenge | $4.99 | “spot the difference hard printable” 140/month; adult/difficult variants 110/month | Adult/senior and large puzzle bundles show hundreds of public reviews |

## Semrush evidence

The source spreadsheets were retained unchanged. The most commercially relevant
queries are:

- `spot the difference printable`: volume 880, keyword difficulty 7
- `spot the difference worksheets`: volume 480, keyword difficulty 2
- `spot the difference for kids`: volume 390, keyword difficulty 14
- `free printable spot the difference`: volume 140, keyword difficulty 7
- `spot the difference hard printable`: volume 140, keyword difficulty 4
- `adult spot the difference printable`: volume 110, keyword difficulty 17
- `difficult spot the difference printable`: volume 110, keyword difficulty 4
- `spot the difference pdf`: volume 110, keyword difficulty 3
- `spot the difference worksheets pdf free download pdf`: volume 70, keyword difficulty 0
- `preschool spot the difference`: volume 30

Volumes are Semrush estimates from the 2026-07-25 US broad-match exports and
should be treated as directional rather than exact traffic forecasts.

## Etsy evidence

The Etsy search page was access-limited from the current network, so product
direction uses Etsy’s publicly indexed category and listing pages. Public review
counts are used as a demand proxy; Etsy does not expose verified unit sales for
every listing.

- Printable category results include a 7-holiday pack with 625 reviews, a
  coloring-page pack with 211 reviews, and preschool/classroom worksheets with
  94 reviews:
  https://www.etsy.com/market/printable_spot_the_difference
- Broader results include adult/senior printables with 944 reviews, adult/teen
  100-puzzle bundles with 448 reviews, Halloween party games with 2.1k reviews,
  and Christmas games with 705 reviews:
  https://www.etsy.com/market/spot_the_differences
- Preschool results include sea-animal worksheets with 419 reviews, farm-animal
  packs with 146 reviews, and easy single-page games with 364 reviews:
  https://www.etsy.com/market/preschool_spot_the_difference
- A representative classroom listing includes one worksheet plus an answer key,
  reinforcing the expectation that printable products clearly state the file
  type, page contents, and delivery method:
  https://www.etsy.com/listing/4442818673/art-room-spot-the-difference-printable

## Implementation implications

- A free pack captures high-volume “free printable” intent and lets buyers verify
  print quality before paying.
- Every paid pack includes answer keys because “with answers” appears in the
  Semrush data and is a standard marketplace expectation.
- Product pages explicitly state PDF format, page count, audience, difficulty,
  license, price, and digital-only delivery.
- Prices sit inside the publicly visible Etsy range for comparable digital
  bundles while remaining simple, one-time USD amounts for PayPal checkout.
