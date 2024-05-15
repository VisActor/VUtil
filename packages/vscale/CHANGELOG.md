# Change Log - @visactor/vscale

This log was last generated on Wed, 08 May 2024 03:41:16 GMT and should not be manually modified.

## 0.18.6
Wed, 08 May 2024 03:41:16 GMT

_Version update only_

## 0.18.5
Sun, 28 Apr 2024 06:32:14 GMT

_Version update only_

## 0.18.4
Fri, 26 Apr 2024 10:58:38 GMT

_Version update only_

## 0.18.3
Fri, 26 Apr 2024 06:44:41 GMT

_Version update only_

## 0.18.2
Tue, 23 Apr 2024 08:05:12 GMT

_Version update only_

## 0.18.1
Mon, 26 Feb 2024 09:44:58 GMT

### Updates

- feat: support the index api to get the index of value in ordianlScale.domain



## 0.18.0
Thu, 22 Feb 2024 03:43:15 GMT

_Version update only_

## 0.17.5
Wed, 21 Feb 2024 07:17:30 GMT

_Version update only_

## 0.17.4
Thu, 25 Jan 2024 06:33:00 GMT

### Updates

- fix: symlog tick. fix#@visactor/vchart#1563

## 0.17.3
Thu, 28 Dec 2023 09:14:51 GMT

### Updates

- fix: fix the bug of log-scale ticks



## 0.17.2
Thu, 28 Dec 2023 07:59:41 GMT

_Version update only_

## 0.17.1
Tue, 05 Dec 2023 13:02:13 GMT

### Updates

- fix: update `scaleWholeRangeSize` method in vscale

## 0.17.0
Mon, 04 Dec 2023 11:26:17 GMT

_Version update only_

## 0.16.18
Thu, 23 Nov 2023 13:01:59 GMT

### Updates

- fix: fix the scale problem in version 0.16.17

## 0.16.17
Thu, 23 Nov 2023 08:52:19 GMT

### Updates

- fix: fix the problems of the inverse case

## 0.16.16
Thu, 23 Nov 2023 04:14:47 GMT

_Version update only_

## 0.16.15
Tue, 21 Nov 2023 14:33:51 GMT

_Version update only_

## 0.16.14
Tue, 21 Nov 2023 09:06:00 GMT

### Updates

- fix: range factor will not be changed if value is 0

## 0.16.13
Mon, 20 Nov 2023 16:06:24 GMT

### Updates

- fix: inaccurate wholeRange in band scale

## 0.16.12
Mon, 20 Nov 2023 06:23:53 GMT

### Updates

- fix: one of the two endpoints of rangeFactor is null during initialization

## 0.16.11
Mon, 20 Nov 2023 03:24:54 GMT

_Version update only_

## 0.16.10
Thu, 16 Nov 2023 09:50:48 GMT

_Version update only_

## 0.16.9
Wed, 15 Nov 2023 12:34:59 GMT

### Updates

- fix: change log nice floor logic

## 0.16.8
Wed, 15 Nov 2023 09:15:26 GMT

### Updates

- feat: add configure rangeFactorStart and rangeFactorEnd to band scale

## 0.16.7
Tue, 07 Nov 2023 03:54:21 GMT

_Version update only_

## 0.16.6
Thu, 26 Oct 2023 07:42:04 GMT

_Version update only_

## 0.16.5
Thu, 19 Oct 2023 02:37:41 GMT

_Version update only_

## 0.16.4
Mon, 16 Oct 2023 08:53:51 GMT

_Version update only_

## 0.16.3
Fri, 13 Oct 2023 06:09:58 GMT

### Updates

- fix: fix the fucntion `supportRangeFactor()`



## 0.16.2
Fri, 13 Oct 2023 01:57:05 GMT

### Updates

- feat: add fish eye effect of scale



## 0.16.1
Wed, 20 Sep 2023 07:58:12 GMT

### Updates

- fix: fix isValidScale did not include threshold scale



## 0.16.0
Thu, 14 Sep 2023 08:04:22 GMT

### Updates

- feat: band scale support fixed band width
- fix: solve the invalid rangeFactor() method of band scale
- fix: update exported types of `IBandLikeScale`
- fix: the start value or end value of rangeFactor in band scale is auto-reserved
- fix: keep the `bandScale.calculateWholeRangeSize()` return result positive

## 0.15.14
Wed, 13 Sep 2023 09:03:21 GMT

### Updates

- fix: linear-scale should only call rescale() when need



## 0.15.13
Wed, 13 Sep 2023 08:43:53 GMT

_Version update only_

## 0.15.12
Fri, 08 Sep 2023 10:02:51 GMT

_Version update only_

## 0.15.11
Thu, 07 Sep 2023 07:01:30 GMT

_Version update only_

## 0.15.10
Mon, 04 Sep 2023 11:52:35 GMT

_Version update only_

## 0.15.9
Tue, 29 Aug 2023 09:23:40 GMT

### Updates

- fix(vscale): identity scale may have no domain



## 0.15.8
Thu, 24 Aug 2023 07:04:39 GMT

### Patches

- feat(symLog): ticks caculation. feat visactor/vchart#508

### Updates

- feat: add identity-scale



## 0.15.7
Wed, 16 Aug 2023 04:17:45 GMT

_Version update only_

## 0.15.6
Wed, 16 Aug 2023 03:11:05 GMT

_Version update only_

## 0.15.5
Fri, 11 Aug 2023 08:33:53 GMT

_Version update only_

## 0.15.4
Thu, 10 Aug 2023 12:06:21 GMT

_Version update only_

## 0.15.3
Thu, 10 Aug 2023 09:49:35 GMT

### Updates

- fix: ticks() should not require strict tickCount


- feat: add niceoptions about forceMin, forceMax, min, max to continuous scales



## 0.15.2
Mon, 07 Aug 2023 06:37:52 GMT

_Version update only_

## 0.15.1
Mon, 07 Aug 2023 06:27:29 GMT

_Version update only_

## 0.15.0
Mon, 07 Aug 2023 06:09:42 GMT

_Version update only_

## 0.14.0
Thu, 03 Aug 2023 08:03:01 GMT

### Minor changes

- feat(vscale): optimize ticks in two case: 1. equal values, 2. tickCount should match parameters, fix #51

## 0.13.4
Thu, 27 Jul 2023 11:58:27 GMT

### Patches

- feat(specified): support null for scale specified return value

### Updates

- feat(logScale): add forceTicks and stepTicks

## 0.13.3
Wed, 19 Jul 2023 12:27:59 GMT

_Version update only_

## 0.13.2
Wed, 19 Jul 2023 11:44:54 GMT

### Patches

- chore: sync version from npm

## 0.13.0
Wed, 19 Jul 2023 11:31:07 GMT

### Minor changes

- ordianl scale support specified

### Patches

- fix linear scale ticks return empty array in negative domain

## 0.11.0
Tue, 20 Jun 2023 08:44:17 GMT

### Minor changes

- release version 0.10.1

### Updates

- release
- release alpha

## 0.9.2
Wed, 31 May 2023 02:35:46 GMT

### Patches

- publish

