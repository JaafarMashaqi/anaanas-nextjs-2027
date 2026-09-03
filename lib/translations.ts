export type SupportedLocale = 'ar' | 'en'

type TranslationKey =
  | 'home.noSections'
  | 'home.viewProfile'
  | 'home.aboutUs'
  | 'home.settings'
  | 'home.support'
  | 'home.feedback'
  | 'home.help'
  | 'home.privacyTerms'
  | 'home.todaysNews'
  | 'home.viewAllLatestNews'
  | 'home.seo.title'
  | 'home.seo.description'
  | 'home.seo.regionFallback'
  | 'home.seo.keywords'
  | 'home.a11y.visuallyHiddenTitle'
  | 'seo.home.feedListings'
  | 'seo.section.categories'
  | 'seo.section.listings'
  | 'seo.category.listings'
  | 'seo.search.results'
  | 'seo.sidebar.sectionsMap'
  | 'home.marketPulse'
  | 'home.marketPulseEmpty'
  | 'home.marketPulseGrowth'
  | 'home.trendingEmpty'
  | 'home.trendingEngagementHint'
  | 'home.cars'
  | 'home.realEstate'
  | 'home.electronics'
  | 'home.jobs'
  | 'home.topPerformingAds'
  | 'home.latestAds'
  | 'home.latestAdsEmpty'
  | 'home.newBadge'
  | 'home.ad.zamzam'
  | 'home.ad.movingHouse'
  | 'home.ad.othman'
  | 'home.ad.electronics'
  | 'home.ad.elite'
  | 'home.ad.tech'
  | 'home.smartOpportunity'
  | 'home.highRoi'
  | 'home.detectedInAmman'
  | 'home.activateOpportunity'
  | 'home.ananasVsOthers'
  | 'home.listings'
  | 'home.marketplace'
  | 'home.classifieds'
  | 'home.aiEngine'
  | 'home.futureRoadmap'
  | 'home.comingSoon'
  | 'home.roadmap.pro'
  | 'home.roadmap.gold'
  | 'home.roadmap.family'
  | 'home.aiInfra.title'
  | 'home.aiInfra.headerPill'
  | 'home.aiInfra.feature1.title'
  | 'home.aiInfra.feature1.desc'
  | 'home.aiInfra.feature2.title'
  | 'home.aiInfra.feature2.desc'
  | 'home.aiInfra.feature3.title'
  | 'home.aiInfra.feature3.desc'
  | 'home.aiInfra.feature4.title'
  | 'home.aiInfra.feature4.desc'
  | 'home.aiInfra.cars'
  | 'home.aiInfra.realEstate'
  | 'home.aiInfra.jobs'
  | 'home.aiInfra.electronics'
  | 'home.aiInfra.trending'
  | 'home.quickLinks'
  | 'home.quick.auction.title'
  | 'home.quick.auction.hint'
  | 'home.quick.auctionPosts.title'
  | 'home.quick.auctionPosts.hint'
  | 'home.elite.title'
  | 'home.elite.b1'
  | 'home.elite.b2'
  | 'home.elite.b3'
  | 'home.elite.cta'
  | 'home.elite.coming'
  | 'home.pro.title'
  | 'home.pro.b1'
  | 'home.pro.b2'
  | 'home.pro.b3'
  | 'sidebar.noSections'
  | 'sidebar.panelTitle'
  | 'sidebar.panelHint'
  | 'sidebar.sectionTeaser'
  | 'sidebar.viewProfile'
  | 'sidebar.aboutUs'
  | 'sidebar.settings'
  | 'sidebar.support'
  | 'sidebar.feedback'
  | 'sidebar.help'
  | 'sidebar.privacyTerms'
  | 'sidebar.contactUs'
  | 'contact.title'
  | 'contact.subtitle'
  | 'contact.name'
  | 'contact.email'
  | 'contact.subject'
  | 'contact.message'
  | 'contact.submit'
  | 'contact.submitting'
  | 'contact.success'
  | 'contact.error'
  | 'contact.nameRequired'
  | 'contact.emailRequired'
  | 'contact.emailInvalid'
  | 'contact.subjectRequired'
  | 'contact.messageRequired'
  | 'contact.rateLimited'
  | 'emailVerify.title'
  | 'emailVerify.subtitle'
  | 'emailVerify.sentTo'
  | 'emailVerify.codeLabel'
  | 'emailVerify.codePlaceholder'
  | 'emailVerify.verify'
  | 'emailVerify.verifying'
  | 'emailVerify.resend'
  | 'emailVerify.resending'
  | 'emailVerify.changeEmail'
  | 'emailVerify.newEmail'
  | 'emailVerify.updateEmail'
  | 'emailVerify.success'
  | 'emailVerify.error'
  | 'emailVerify.codeRequired'
  | 'emailVerify.emailRequired'
  | 'emailVerify.emailInvalid'
  | 'emailVerify.signOut'
  | 'emailVerify.hint'
  | 'auth.welcome'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'auth.createAccount'
  | 'auth.noAccount'
  | 'auth.hasAccount'
  | 'auth.clickToSignUp'
  | 'auth.clickToSignIn'
  | 'auth.emailOrPhone'
  | 'auth.enterEmailOrPhone'
  | 'auth.password'
  | 'auth.enterPassword'
  | 'auth.confirmPassword'
  | 'auth.enterConfirmPassword'
  | 'auth.rememberMe'
  | 'auth.forgotPassword'
  | 'auth.forgotPassTitle'
  | 'auth.forgotPassDesc'
  | 'auth.sendResetLink'
  | 'auth.sending'
  | 'auth.checkEmail'
  | 'auth.checkEmailDesc'
  | 'auth.backToSignIn'
  | 'auth.resetPassTitle'
  | 'auth.resetPassDesc'
  | 'auth.newPassword'
  | 'auth.enterNewPassword'
  | 'auth.resetPassword'
  | 'auth.resetting'
  | 'auth.resetSuccess'
  | 'auth.resetLinkExpired'
  | 'auth.submit'
  | 'auth.signingIn'
  | 'auth.creating'
  | 'auth.name'
  | 'auth.enterName'
  | 'auth.mobile'
  | 'auth.enterMobile'
  | 'auth.email'
  | 'auth.enterEmail'
  | 'auth.nameOptional'
  | 'auth.mobileOptional'
  | 'auth.emailOptional'
  | 'auth.allRightsReserved'
  | 'auth.terms'
  | 'auth.privacy'
  | 'auth.cookies'
  | 'auth.passwordMismatch'
  | 'auth.passwordRequired'
  | 'auth.passwordMinLength'
  | 'auth.confirmPasswordRequired'
  | 'auth.nameRequired'
  | 'auth.emailRequired'
  | 'auth.nameMaxLength'
  | 'auth.invalidEmail'
  | 'post.editPost'
  | 'post.deletePost'
  | 'post.confirmDelete'
  | 'post.user'
  | 'post.you'
  | 'post.readMore'
  | 'post.addComment'
  | 'post.loginToComment'
  | 'post.loginRequired'
  | 'post.cannotCommentWithoutLogin'
  | 'post.loadMoreComments'
  | 'post.viewMoreComments'
  | 'post.contact'
  | 'post.sendEmail'
  | 'post.noContactData'
  | 'post.watchOnAnanas'
  | 'post.failedToOpenChat'
  | 'post.pleaseTryAgain'
  | 'post.errorDeletingPost'
  | 'post.viewAll'
  | 'post.liked'
  | 'post.like'
  | 'post.comment'
  | 'post.share'
  | 'post.chat'
  | 'post.openChat'
  | 'post.loginToChat'
  | 'post.commentAction'
  | 'post.reply'
  | 'post.viewReplies'
  | 'post.writeReply'
  | 'post.send'
  | 'post.loadingReplies'
  | 'post.loadMoreReplies'
  | 'post.unlike'
  | 'post.likeComment'
  | 'post.statistics'
  | 'post.detailsTitle'
  | 'post.similarTitle'
  | 'post.notFound.title'
  | 'post.report.menu'
  | 'post.report.title'
  | 'post.report.subtitle'
  | 'post.report.categoryLabel'
  | 'post.report.category.spam'
  | 'post.report.category.harassment'
  | 'post.report.category.scam'
  | 'post.report.category.inappropriate'
  | 'post.report.category.other'
  | 'post.report.reasonLabel'
  | 'post.report.reasonPlaceholder'
  | 'post.report.descriptionLabel'
  | 'post.report.descriptionPlaceholder'
  | 'post.report.submit'
  | 'post.report.submitting'
  | 'post.report.cancel'
  | 'post.report.success'
  | 'post.report.error'
  | 'post.report.loginRequired'
  | 'post.notFound.lead'
  | 'post.notFound.leadWithId'
  | 'post.notFound.mightInterestYou'
  | 'post.notFound.noSuggestions'
  | 'post.statusBanner.pendingReview.title'
  | 'post.statusBanner.pendingReview.message'
  | 'post.statusBanner.rejected.title'
  | 'post.statusBanner.rejected.message'
  | 'post.moreFromSection'
  | 'post.noSimilar'
  | 'post.noAttributes'
  | 'post.attribute'
  | 'post.value'
  | 'profile.user'
  | 'profile.editProfile'
  | 'profile.shareProfile'
  | 'profile.savePdf'
  | 'profile.lockProfile'
  | 'profile.settings'
  | 'profile.aboutTitle'
  | 'profile.aboutEmpty'
  | 'profile.about.born'
  | 'profile.about.email'
  | 'profile.about.mobile'
  | 'profile.about.username'
  | 'profile.about.joined'
  | 'profile.followsTitle'
  | 'profile.followsHint'
  | 'profile.tabs.feed'
  | 'profile.tabs.about'
  | 'profile.tabs.activity'
  | 'profile.tabs.statistics'
  | 'profile.noPosts'
  | 'profile.postsError'
  | 'profile.noImages'
  | 'profile.imagesError'
  | 'profile.photos'
  | 'profile.photosLoading'
  | 'profile.stats.title'
  | 'profile.stats.subtitle'
  | 'profile.stats.totalPosts'
  | 'profile.stats.activePosts'
  | 'profile.stats.deletedPosts'
  | 'profile.stats.comments'
  | 'profile.stats.interactions'
  | 'profile.stats.breakdownTitle'
  | 'profile.stats.emptyBreakdown'
  | 'profile.stats.dailyTitle'
  | 'profile.stats.metricTitle'
  | 'profile.stats.chartLine'
  | 'profile.stats.chartBar'
  | 'profile.stats.interactionsDaily'
  | 'profile.stats.loadError'
  | 'profile.stats.statusBreakdown'
  | 'profile.stats.statusUnknown'
  | 'stats.title'
  | 'stats.subtitle'
  | 'stats.backToPost'
  | 'stats.from'
  | 'stats.to'
  | 'stats.apply'
  | 'stats.loading'
  | 'stats.preset.7d'
  | 'stats.preset.30d'
  | 'stats.preset.90d'
  | 'stats.kpi.impressions'
  | 'stats.kpi.uniqueImpressions'
  | 'stats.kpi.views'
  | 'stats.kpi.interactions'
  | 'stats.kpi.calls'
  | 'stats.kpi.shares'
  | 'stats.kpi.chats'
  | 'stats.tabs.overview'
  | 'stats.tabs.interactions'
  | 'stats.tabs.audience'
  | 'stats.charts.viewsVsUnique'
  | 'stats.charts.breakdown'
  | 'stats.charts.interactionsOverTime'
  | 'stats.hint.uniqueDefinition'
  | 'stats.top.userAgents'
  | 'stats.ua'
  | 'stats.count'
  | 'stats.noData'
  | 'stats.event.impressions'
  | 'stats.event.views'
  | 'stats.event.calls'
  | 'stats.event.shares'
  | 'stats.event.chats'
  | 'stats.event.likes'
  | 'stats.event.unlikes'
  | 'stats.event.comments'
  | 'dialog.loginRequired.title'
  | 'dialog.loginRequired.message'
  | 'dialog.loginRequired.loginButton'
  | 'dialog.loginRequired.cancelButton'
  | 'dialog.emailVerify.title'
  | 'dialog.emailVerify.message'
  | 'dialog.emailVerify.verifyButton'
  | 'dialog.emailVerify.cancelButton'
  | 'filter.filterResults'
  | 'filter.filterDescription'
  | 'filter.close'
  | 'filter.reset'
  | 'filter.city'
  | 'filter.allCities'
  | 'filter.priceRange'
  | 'filter.from'
  | 'filter.to'
  | 'filter.postAttributes'
  | 'filter.apply'
  | 'filter.noAttributesAvailable'
  | 'filter.selectField'
  | 'filter.postImages'
  | 'filter.allPosts'
  | 'filter.withImages'
  | 'filter.withoutImages'
  | 'filter.sortBy'
  | 'filter.sortNewest'
  | 'filter.sortOldest'
  | 'filter.sortPriceLowToHigh'
  | 'filter.sortPriceHighToLow'
  | 'createPost.smartTitle'
  | 'createPost.heroTitle'
  | 'createPost.heroSubtitle'
  | 'createPost.heroAddAd'
  | 'createPost.heroPlaceholder'
  | 'createPost.heroTagTitle'
  | 'createPost.heroTagDesc'
  | 'createPost.heroTagPrice'
  | 'createPost.heroTagPhotos'
  | 'createPost.launch'
  | 'createPost.placeholder'
  | 'createPost.chipDemand'
  | 'createPost.chipRoi'
  | 'createPost.chipTarget'
  | 'createPost.chipBudget'
  | 'createPost.wizard.step1'
  | 'createPost.wizard.step2'
  | 'createPost.wizard.step3'
  | 'createPost.wizard.step4'
  | 'createPost.wizard.step5'
  | 'createPost.wizard.step6'
  | 'createPost.wizard.dynamicFields'
  | 'createPost.wizard.lead'
  | 'createPost.wizard.navPrev'
  | 'createPost.wizard.navNext'
  | 'createPost.wizard.navSubmit'
  | 'createPost.wizard.navSubmitEdit'
  | 'createPost.wizard.navSubmitting'
  | 'createPost.edit.reviewNoticeTitle'
  | 'createPost.edit.reviewNoticeMessage'
  | 'createPost.edit.confirmTitle'
  | 'createPost.edit.confirmMessage'
  | 'createPost.edit.confirmContinue'
  | 'createPost.edit.confirmCancel'
  | 'createPost.photos.title'
  | 'createPost.photos.hint'
  | 'createPost.photos.savedTitle'
  | 'createPost.photos.savedHint'
  | 'createPost.photos.newTitle'
  | 'createPost.photos.badgeSuffix'
  | 'createPost.photos.dropHint'
  | 'createPost.photos.dropActive'
  | 'createPost.photos.addSlot'
  | 'createPost.photos.removeAria'
  | 'createPost.photos.deleteSaved'
  | 'createPost.photos.deleting'
  | 'createPost.photos.rules'
  | 'createPost.photos.confirmDelete'
  | 'createPost.photos.deleteFailed'
  | 'createPost.photos.errTooLarge'
  | 'createPost.photos.errBadType'
  | 'createPost.photos.errSlotsFull'
  | 'createPost.photos.errSomeSkipped'
  | 'createPost.success.celebrationTitle'
  | 'createPost.success.celebrationSubtitle'
  | 'createPost.success.pendingTitle'
  | 'createPost.success.pendingSubtitle'
  | 'createPost.success.viewMyAds'
  | 'createPost.success.viewPost'
  | 'createPost.success.viewFeed'
  | 'createPost.success.viewHomeFeed'
  | 'createPost.success.close'
  | 'createPost.success.updated'
  | 'createPost.success.updatedPending'
  | 'createPost.rateLimit.title'
  | 'createPost.rateLimit.checking'
  | 'createPost.rateLimit.intervalHint'
  | 'createPost.rateLimit.hourlyHint'
  | 'createPost.rateLimit.countdownLabel'
  | 'createPost.rateLimit.verificationHint'
  | 'createPost.rateLimit.requestVerification'
  | 'createPost.rateLimit.requestVerificationSubmitting'
  | 'createPost.rateLimit.requestVerificationPending'
  | 'createPost.rateLimit.requestVerificationRetry'
  | 'createPost.rateLimit.requestVerificationFailed'
  | 'auction.searchPlaceholder'
  | 'auction.postAd'
  | 'auction.boost'
  | 'auction.chip.updates'
  | 'auction.chip.lives'
  | 'auction.chip.hotDeals'
  | 'auction.chip.auctions'
  | 'auction.tab.realEstate'
  | 'auction.tab.furniture'
  | 'auction.tab.electronics'
  | 'auction.tab.auctions'
  | 'auction.trending.title'
  | 'auction.trending.hint'
  | 'auction.trending.cars'
  | 'auction.trending.villa'
  | 'auction.trending.brand'
  | 'auction.trending.boost'
  | 'auction.trending.metaNew'
  | 'auction.trending.metaHot'
  | 'auction.trending.metaNow'
  | 'auction.trending.metaPromo'
  | 'auction.live.title'
  | 'auction.live.hint'
  | 'auction.live.endsIn'
  | 'auction.live.bids'
  | 'auction.live.currentPrice'
  | 'auction.live.secure'
  | 'auction.live.bidNow'
  | 'auction.live.showcase'
  | 'auction.live.tires'
  | 'auction.live.shoes'
  | 'auction.live.tools'
  | 'auction.panel.title'
  | 'auction.panel.hint'
  | 'auction.panel.chooseCategory'
  | 'auction.panel.typeCategory'
  | 'auction.panel.go'
  | 'auction.panel.uploadMedia'
  | 'auction.panel.dragDrop'
  | 'auction.panel.upload'
  | 'auction.step.start'
  | 'auction.step.next'
  | 'auction.step.done'
  | 'auction.step1.title'
  | 'auction.step1.desc'
  | 'auction.step2.title'
  | 'auction.step2.desc'
  | 'auction.step3.title'
  | 'auction.step3.desc'
  | 'auction.step4.title'
  | 'auction.step4.desc'
  | 'auction.publish'
  | 'auctionPosts.brandGuide'
  | 'auctionPosts.heroTitle'
  | 'auctionPosts.heroSubtitle'
  | 'auctionPosts.trendingTitle'
  | 'auctionPosts.livePackageTitle'
  | 'auctionPosts.postAdTitle'
  | 'auctionPosts.postAdDesc'
  | 'auctionPosts.tag.popular'
  | 'auctionPosts.tag.live'
  | 'auctionPosts.tag.brand'
  | 'auctionPosts.cta.bid'
  | 'auctionPosts.cta.boostAd'
  | 'auctionPosts.live.card1.title'
  | 'auctionPosts.live.card2.title'
  | 'auctionPosts.live.card1.topTitle'
  | 'auctionPosts.live.card1.topSub'
  | 'auctionPosts.live.card1.desc'
  | 'auctionPosts.live.card2.topTitle'
  | 'auctionPosts.live.card2.topSub'
  | 'auctionPosts.live.card2.desc'
  | 'auctionPosts.live.card3.title'
  | 'auctionPosts.live.card3.desc'
  | 'auctionPosts.small.new'
  | 'auctionPosts.small.likes'
  | 'auctionPosts.small.boost'
  | 'auctionPosts.small.view'
  | 'auctionPosts.small.recommended'
  | 'auctionPosts.small.sponsored'
  | 'auctionPosts.small.live'
  | 'auctionPosts.small.captions'
  | 'auctionPosts.trending.pill'
  | 'auctionPosts.trending.badgeAd'
  | 'auctionPosts.trending.like'
  | 'auctionPosts.trending.live'
  | 'auctionPosts.trending.card2.line1'
  | 'auctionPosts.trending.card2.line2'
  | 'auctionPosts.trending.card3.line1'
  | 'auctionPosts.trending.card3.line2'
  | 'auctionPosts.live.pill.community'
  | 'auctionPosts.live.priceNote.bid'
  | 'auctionPosts.live.priceNote.shares'
  | 'auctionPosts.live.unit.rma'
  | 'auctionPosts.live.footerNote.a'
  | 'auctionPosts.live.footerNote.b'
  | 'auctionPosts.live.footerNote.c'
  | 'auctionPosts.live.bio'
  | 'auctionPosts.live.col1.k'
  | 'auctionPosts.live.col1.v'
  | 'auctionPosts.live.col2.k'
  | 'auctionPosts.live.col2.v'
  | 'notifications.title'
  | 'notifications.subtitle'
  | 'notifications.empty'
  | 'notifications.emptyHint'
  | 'notifications.viewAll'
  | 'notifications.markAll'
  | 'notifications.markAllShort'
  | 'notifications.unreadOne'
  | 'notifications.unreadFew'
  | 'notifications.allCaughtUp'
  | 'notifications.loading'
  | 'notifications.justNow'
  | 'notifications.openBell'
  | 'notifications.closeBell'
  | 'notifications.newBadge'
  | 'realtime.newPost.title'
  | 'realtime.newPost.subtitle'
  | 'realtime.newPost.viewNow'
  | 'realtime.newPost.dismiss'
  | 'realtime.newPost.disable'
  | 'realtime.newPost.disabledHint'
  | 'realtime.newPost.enable'
  | 'realtime.newPost.justNow'
  | 'realtime.newPost.byAuthor'
  | 'realtime.newPost.pushedBadge'
  | 'realtime.newPost.justArrived'
  // Messaging / Chat
  | 'messaging.title'
  | 'messaging.searchPlaceholder'
  | 'messaging.empty'
  | 'messaging.emptyHint'
  | 'messaging.noConversations'
  | 'messaging.startConversation'
  | 'messaging.selectConversation'
  | 'messaging.selectConversationHint'
  | 'messaging.online'
  | 'messaging.offline'
  | 'messaging.typing'
  | 'messaging.you'
  | 'messaging.justNow'
  | 'messaging.minutesAgo'
  | 'messaging.hoursAgo'
  | 'messaging.daysAgo'
  | 'messaging.yesterday'
  | 'messaging.today'
  | 'messaging.composerPlaceholder'
  | 'messaging.send'
  | 'messaging.attach'
  | 'messaging.emoji'
  | 'messaging.composerDisabledClosed'
  | 'messaging.composerDisabledBlocked'
  | 'messaging.viewPost'
  | 'messaging.linkedPost'
  | 'messaging.postId'
  | 'messaging.menu'
  | 'messaging.actions.markRead'
  | 'messaging.actions.viewProfile'
  | 'messaging.actions.viewPost'
  | 'messaging.actions.clear'
  | 'messaging.actions.close'
  | 'messaging.actions.reopen'
  | 'messaging.actions.block'
  | 'messaging.actions.unblock'
  | 'messaging.actions.report'
  | 'messaging.actions.delete'
  | 'messaging.confirm.clearTitle'
  | 'messaging.confirm.clearBody'
  | 'messaging.confirm.closeTitle'
  | 'messaging.confirm.closeBody'
  | 'messaging.confirm.blockTitle'
  | 'messaging.confirm.blockBody'
  | 'messaging.confirm.deleteTitle'
  | 'messaging.confirm.deleteBody'
  | 'messaging.confirm.confirm'
  | 'messaging.confirm.cancel'
  | 'messaging.report.title'
  | 'messaging.report.subtitle'
  | 'messaging.report.categoryLabel'
  | 'messaging.report.category.spam'
  | 'messaging.report.category.harassment'
  | 'messaging.report.category.scam'
  | 'messaging.report.category.inappropriate'
  | 'messaging.report.category.other'
  | 'messaging.report.reasonLabel'
  | 'messaging.report.reasonPlaceholder'
  | 'messaging.report.descriptionLabel'
  | 'messaging.report.descriptionPlaceholder'
  | 'messaging.report.submit'
  | 'messaging.report.submitting'
  | 'messaging.report.success'
  | 'messaging.report.error'
  | 'messaging.banner.closed'
  | 'messaging.banner.blockedByYou'
  | 'messaging.banner.blockedByOther'
  | 'messaging.banner.cleared'
  | 'messaging.banner.connecting'
  | 'messaging.banner.live'
  | 'messaging.banner.polling'
  | 'messaging.errors.send'
  | 'messaging.errors.load'
  | 'messaging.unread'
  | 'messaging.delivered'
  | 'messaging.seen'
  | 'messaging.sent'
  | 'messaging.sending'
  | 'messaging.failed'
  | 'messaging.retry'
  // Global 404 (not-found)
  | 'notFound.badge'
  | 'notFound.title'
  | 'notFound.lead'
  | 'notFound.backHome'
  | 'notFound.siteName'
  // Select country (public / SEO)
  | 'selectCountry.metaTitle'
  | 'selectCountry.metaDescription'
  | 'selectCountry.h1'
  | 'selectCountry.lead'
  | 'selectCountry.intro'
  | 'selectCountry.listTitle'
  | 'selectCountry.cardCta'
  | 'selectCountry.cardHint'
  | 'selectCountry.isoLabel'
  | 'selectCountry.empty'
  | 'selectCountry.switchToEn'
  | 'selectCountry.switchToAr'
  | 'selectCountry.langSwitchAria'
  | 'selectCountry.skipToList'
  | 'selectCountry.breadcrumbHome'
  | 'selectCountry.breadcrumbCurrent'

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  ar: {
    'home.noSections': 'لا توجد أقسام متاحة حاليًا',
    'home.viewProfile': 'عرض الملف الشخصي',
    'home.aboutUs': 'من نحن',
    'home.settings': 'الاعدادات',
    'home.support': 'الدعم الفني',
    'home.feedback': 'الملاحظات',
    'home.help': 'المساعدة',
    'home.privacyTerms': 'الخصوصية والشروط',
    'home.todaysNews': 'أخبار اليوم',
    'home.viewAllLatestNews': 'عرض جميع الأخبار',
    'home.seo.title': 'منصة أناناس للإعلانات الرقمية والتسويق والتجارة الأولى في {{country}}',
    'home.seo.description':
      'اكتشف إعلانات ومنشورات وفرصاً في {{country}} على منصة أناناس: تصفّح الأقسام، تابع نبض السوق، وتواصل مع البائعين بأمان.',
    'home.seo.regionFallback': 'منطقتك',
    'home.seo.keywords':
      'أناناس، إعلانات مبوبة، تسويق رقمي، تجارة إلكترونية، سوق، {{country}}، منشورات، بيع، شراء',
    'home.a11y.visuallyHiddenTitle': 'الصفحة الرئيسية — منصة أناناس في {{country}}',
    'seo.home.feedListings': 'آخر المنشورات والإعلانات',
    'seo.section.categories': 'فئات القسم',
    'seo.section.listings': 'منشورات {{name}}',
    'seo.category.listings': 'منشورات {{name}}',
    'seo.search.results': 'نتائج البحث',
    'seo.sidebar.sectionsMap': 'خريطة أقسام الموقع',
    'home.marketPulse': 'نبض السوق',
    'home.marketPulseEmpty': 'لا توجد أقسام بزيادة واضحة (+1٪) خلال آخر 30 يوماً مقارنة بالـ 30 يوماً السابقة.',
    'home.marketPulseGrowth': 'نمو',
    'home.trendingEmpty': 'لا توجد إعلانات بارزة بالتفاعل حالياً في بلدك.',
    'home.trendingEngagementHint': 'تعليقات وتفاعلات',
    'home.cars': 'سيارات',
    'home.realEstate': 'عقارات',
    'home.electronics': 'إلكترونيات',
    'home.jobs': 'وظائف',
    'home.topPerformingAds': 'أفضل الإعلانات اليوم',
    'home.latestAds': 'آخر الإعلانات',
    'home.latestAdsEmpty': 'لا توجد إعلانات جديدة حالياً.',
    'home.newBadge': 'جديد',
    'home.ad.zamzam': 'زمزم زمان',
    'home.ad.movingHouse': 'شركة نقل أثاث',
    'home.ad.othman': 'عثمان للعقارات',
    'home.ad.electronics': 'إيتنـزا للإلكترونيات',
    'home.ad.elite': 'إليت ريز إلكترونكس',
    'home.ad.tech': 'تقنيات ذكية',
    'home.smartOpportunity': 'تنبيهات فرص ذكية',
    'home.highRoi': '3 مجالات عالية العائد',
    'home.detectedInAmman': 'تم رصدها في عمّان',
    'home.activateOpportunity': 'فعّل الفرصة',
    'home.ananasVsOthers': 'أناناس مقابل الآخرين',
    'home.listings': 'قوائم',
    'home.marketplace': 'سوق',
    'home.classifieds': 'إعلانات مبوبة',
    'home.aiEngine': 'محرك إعلانات ذكي',
    'home.futureRoadmap': 'خارطة المستقبل',
    'home.comingSoon': 'قريباً',
    'home.roadmap.pro': 'Ananas Pro – أدوات ذكاء متقدمة',
    'home.roadmap.gold': 'Ananas Gold – ترويج VIP',
    'home.roadmap.family': 'Ananas Family – مزايا عائلية',
    'home.aiInfra.title': 'البنية التحتية للذكاء الاصطناعي',
    'home.aiInfra.headerPill': 'Tapiz: 2 gigs',
    'home.aiInfra.feature1.title': 'محرك التنبؤ',
    'home.aiInfra.feature1.desc': 'يتوقع طلب 7 أيام',
    'home.aiInfra.feature2.title': 'سمارت بوست 3.0',
    'home.aiInfra.feature2.desc': 'تعزيز الظهور تلقائياً',
    'home.aiInfra.feature3.title': 'محرك المزادات',
    'home.aiInfra.feature3.desc': 'مزايدة آنية',
    'home.aiInfra.feature4.title': 'DNA الجمهور',
    'home.aiInfra.feature4.desc': 'تجميع السلوك',
    'home.aiInfra.cars': 'سيارات',
    'home.aiInfra.realEstate': 'عقارات',
    'home.aiInfra.jobs': 'وظائف',
    'home.aiInfra.electronics': 'إلكترونيات',
    'home.aiInfra.trending': 'رائج',
    'home.quickLinks': 'روابط سريعة',
    'home.quick.auction.title': 'تجربة المزادات',
    'home.quick.auction.hint': 'واجهة تفاعلية بتصميم حديث',
    'home.quick.auctionPosts.title': 'تجربة إعلانات المزاد',
    'home.quick.auctionPosts.hint': 'عرض بطاقات وإضافات جميلة',
    'home.elite.title': 'Elite – وصول ذكي يتجاوز 1 مليون',
    'home.elite.b1': 'ترتيب محسّن بالذكاء',
    'home.elite.b2': 'أولوية للمزادات المبكرة',
    'home.elite.b3': 'حماية نزاهة المزاد',
    'home.elite.cta': 'الترقية إلى Elite',
    'home.elite.coming': 'قريباً',
    'home.pro.title': 'Ananas Pro',
    'home.pro.b1': 'أدوات ذكاء متقدمة',
    'home.pro.b2': 'تعزيز VIP للظهور',
    'home.pro.b3': 'إدارة حسابات متعددة',
    'sidebar.noSections': 'لا توجد أقسام متاحة حاليًا',
    'sidebar.panelTitle': 'أقسام الإعلانات',
    'sidebar.panelHint': 'اختر القسم للوصول السريع إلى إعلاناتك المفضلة',
    'sidebar.sectionTeaser': 'بتبحث عن «{{section}}»؟ اضغط هنا',
    'sidebar.viewProfile': 'عرض الملف الشخصي',
    'sidebar.aboutUs': 'من نحن',
    'sidebar.settings': 'الاعدادات',
    'sidebar.support': 'الدعم الفني',
    'sidebar.feedback': 'الملاحظات',
    'sidebar.help': 'المساعدة',
    'sidebar.privacyTerms': 'الخصوصية والشروط',
    'sidebar.contactUs': 'تواصل معنا',
    'contact.title': 'تواصل معنا',
    'contact.subtitle': 'أرسل رسالتك وسنرد عليك في أقرب وقت ممكن.',
    'contact.name': 'الاسم',
    'contact.email': 'البريد الإلكتروني',
    'contact.subject': 'الموضوع',
    'contact.message': 'الرسالة',
    'contact.submit': 'إرسال',
    'contact.submitting': 'جاري الإرسال...',
    'contact.success': 'تم إرسال رسالتك بنجاح. شكراً لتواصلك معنا.',
    'contact.error': 'تعذّر إرسال الرسالة. حاول مرة أخرى.',
    'contact.nameRequired': 'يرجى إدخال الاسم',
    'contact.emailRequired': 'يرجى إدخال البريد الإلكتروني',
    'contact.emailInvalid': 'البريد الإلكتروني غير صحيح',
    'contact.subjectRequired': 'يرجى إدخال الموضوع',
    'contact.messageRequired': 'يرجى كتابة الرسالة',
    'contact.rateLimited': 'محاولات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
    'emailVerify.title': 'تأكيد البريد الإلكتروني',
    'emailVerify.subtitle': 'يجب تأكيد بريدك قبل النشر أو التفاعل على الإعلانات.',
    'emailVerify.sentTo': 'أرسلنا رمز التحقق إلى:',
    'emailVerify.codeLabel': 'رمز التحقق',
    'emailVerify.codePlaceholder': '000000',
    'emailVerify.verify': 'تأكيد',
    'emailVerify.verifying': 'جاري التحقق...',
    'emailVerify.resend': 'إعادة إرسال الرمز',
    'emailVerify.resending': 'جاري الإرسال...',
    'emailVerify.changeEmail': 'تغيير البريد الإلكتروني',
    'emailVerify.newEmail': 'البريد الجديد',
    'emailVerify.updateEmail': 'تحديث وإرسال رمز جديد',
    'emailVerify.success': 'تم تأكيد بريدك بنجاح!',
    'emailVerify.error': 'تعذّر إتمام العملية. حاول مرة أخرى.',
    'emailVerify.codeRequired': 'يرجى إدخال رمز التحقق',
    'emailVerify.emailRequired': 'يرجى إدخال البريد الإلكتروني',
    'emailVerify.emailInvalid': 'البريد الإلكتروني غير صحيح',
    'emailVerify.signOut': 'تسجيل الخروج',
    'emailVerify.hint': 'تحقق من صندوق الوارد أو مجلد الرسائل غير المرغوب فيها.',
    'auth.welcome': 'اهلا بك في منصه اناناس الاعلانيه',
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'انشئ حساب جديد الآن',
    'auth.createAccount': 'انشئ حساب جديد',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'هل تملك حساب بالفعل؟',
    'auth.clickToSignUp': 'انقر هنا للتسجيل',
    'auth.clickToSignIn': 'تسجيل الدخول هنا',
    'auth.emailOrPhone': 'البريد الإلكتروني (أو رقم الهاتف)',
    'auth.enterEmailOrPhone': 'أدخل البريد الإلكتروني (أو رقم الهاتف)',
    'auth.password': 'كلمة المرور',
    'auth.enterPassword': 'أدخل كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.enterConfirmPassword': 'أدخل تأكيد كلمة المرور',
    'auth.rememberMe': 'تذكرني؟',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.forgotPassTitle': 'استعادة كلمة المرور',
    'auth.forgotPassDesc': 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
    'auth.sendResetLink': 'إرسال رابط إعادة التعيين',
    'auth.sending': 'جاري الإرسال...',
    'auth.checkEmail': 'تحقق من بريدك الإلكتروني',
    'auth.checkEmailDesc': 'إذا كان هذا البريد مرتبطاً بحساب، فستتلقى رابط إعادة تعيين كلمة المرور.',
    'auth.backToSignIn': 'العودة لتسجيل الدخول',
    'auth.resetPassTitle': 'تعيين كلمة مرور جديدة',
    'auth.resetPassDesc': 'أدخل كلمة المرور الجديدة وتأكيدها.',
    'auth.newPassword': 'كلمة المرور الجديدة',
    'auth.enterNewPassword': 'أدخل كلمة المرور الجديدة',
    'auth.resetPassword': 'تعيين كلمة المرور',
    'auth.resetting': 'جاري التعيين...',
    'auth.resetSuccess': 'تم تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
    'auth.resetLinkExpired': 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.',
    'auth.submit': 'تسجيل الدخول',
    'auth.signingIn': 'جاري تسجيل الدخول...',
    'auth.creating': 'جاري الإنشاء...',
    'auth.name': 'الاسم',
    'auth.enterName': 'ادخل اسمك',
    'auth.mobile': 'رقم الهاتف',
    'auth.enterMobile': 'ادخل رقم الهاتف',
    'auth.email': 'البريد الإلكتروني',
    'auth.enterEmail': 'ادخل بريدك الالكتروني',
    'auth.nameOptional': 'الاسم (اختياري)',
    'auth.mobileOptional': 'رقم الهاتف (اختياري)',
    'auth.emailOptional': 'بريدك الالكتروني (اختياري)',
    'auth.allRightsReserved': 'جميع الحقوق محفوظة',
    'auth.terms': 'الشروط',
    'auth.privacy': 'الخصوصية',
    'auth.cookies': 'ملفات تعريف الارتباط',
    'auth.passwordMismatch': 'كلمة المرور غير متطابقه',
    'auth.passwordRequired': 'ادخل كلمة المرور',
    'auth.passwordMinLength': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'auth.nameRequired': 'الاسم مطلوب',
    'auth.emailRequired': 'البريد الإلكتروني مطلوب',
    'auth.nameMaxLength': 'الاسم يجب ألا يتجاوز 255 حرفاً',
    'auth.confirmPasswordRequired': 'ادخل تأكيد كلمة المرور',
    'auth.invalidEmail': 'ادخل بريدك الالكتروني الصحيح',
    'post.editPost': 'تعديل المنشور',
    'post.deletePost': 'حذف المنشور',
    'post.confirmDelete': 'هل أنت متأكد من حذف هذا المنشور؟',
    'post.user': 'مستخدم',
    'post.you': 'أنت',
    'post.readMore': 'عرض المزيد',
    'post.addComment': 'أضف تعليق...',
    'post.loginToComment': 'سجّل الدخول لإضافة تعليق',
    'post.loginRequired': 'تسجيل الدخول مطلوب',
    'post.cannotCommentWithoutLogin': 'لا يمكنك التعليق إلا بعد تسجيل الدخول',
    'post.loadMoreComments': 'تحميل المزيد من التعليقات',
    'post.viewMoreComments': 'عرض المزيد من التعليقات',
    'post.contact': 'اتصال',
    'post.sendEmail': 'إرسال بريد',
    'post.noContactData': 'لا يوجد بيانات اتصال',
    'post.watchOnAnanas': 'شاهد على منصه اناناس',
    'post.failedToOpenChat': 'فشل في فتح الدردشة',
    'post.pleaseTryAgain': 'يرجى المحاولة مرة أخرى.',
    'post.errorDeletingPost': 'حدث خطأ أثناء حذف المنشور',
    'post.viewAll': 'عرض الكل',
    'post.liked': 'أعجبني',
    'post.like': 'إعجاب',
    'post.comment': 'تعليق',
    'post.share': 'مشاركة',
    'post.chat': 'دردشة',
    'post.openChat': 'فتح الدردشة',
    'post.loginToChat': 'سجّل الدخول للدردشة',
    'post.commentAction': 'تعليق',
    'post.reply': 'رد',
    'post.viewReplies': 'عرض الردود',
    'post.writeReply': 'اكتب رد...',
    'post.send': 'إرسال',
    'post.loadingReplies': 'جاري تحميل الردود...',
    'post.loadMoreReplies': 'تحميل المزيد من الردود',
    'post.unlike': 'إلغاء الإعجاب',
    'post.likeComment': 'إعجاب',
    'post.statistics': 'إحصائيات الإعلان',
    'post.detailsTitle': 'تفاصيل الإعلان',
    'post.similarTitle': 'إعلانات مشابهة',
    'post.report.menu': 'الإبلاغ عن الإعلان',
    'post.report.title': 'الإبلاغ عن هذا الإعلان',
    'post.report.subtitle': 'اختر سبب البلاغ. سيصل لفريق الإشراف للمراجعة. يمكنك الإبلاغ مرة واحدة فقط لكل إعلان.',
    'post.report.categoryLabel': 'سبب البلاغ',
    'post.report.category.spam': 'سبام / إعلان مزعج',
    'post.report.category.harassment': 'تحرّش / مضايقة',
    'post.report.category.scam': 'احتيال',
    'post.report.category.inappropriate': 'محتوى غير لائق',
    'post.report.category.other': 'سبب آخر',
    'post.report.reasonLabel': 'وصف مختصر',
    'post.report.reasonPlaceholder': 'اكتب سبب البلاغ بإيجاز...',
    'post.report.descriptionLabel': 'تفاصيل إضافية (اختياري)',
    'post.report.descriptionPlaceholder': 'أي تفاصيل تساعد فريق الإشراف...',
    'post.report.submit': 'إرسال البلاغ',
    'post.report.submitting': 'جارٍ الإرسال...',
    'post.report.cancel': 'إلغاء',
    'post.report.success': 'تم استلام البلاغ. سيقوم الفريق بمراجعته.',
    'post.report.error': 'تعذّر إرسال البلاغ. حاول مرة أخرى.',
    'post.report.loginRequired': 'يجب تسجيل الدخول للإبلاغ عن الإعلان.',
    'post.notFound.title': 'هذا الإعلان غير متاح',
    'post.notFound.lead': 'ربما حُذف الإعلان أو لم يُنشر بعد، أو أن الرابط غير صحيح.',
    'post.notFound.leadWithId': 'الإعلان رقم {id} غير متاح. ربما حُذف أو لم يُقبل بعد، أو أن الرابط غير صحيح.',
    'post.notFound.mightInterestYou': 'قد يهمك',
    'post.notFound.noSuggestions': 'لا توجد إعلانات مقترحة في بلدك حالياً.',
    'post.statusBanner.pendingReview.title': 'قيد المراجعة',
    'post.statusBanner.pendingReview.message':
      'إعلانك بانتظار موافقة الإدارة. يظهر لك فقط حتى يُقبل ويُنشر للجميع.',
    'post.statusBanner.rejected.title': 'مرفوض',
    'post.statusBanner.rejected.message':
      'لم يُقبل هذا الإعلان. يمكنك تعديله وإعادة الإرسال، ويظهر لك فقط.',
    'post.moreFromSection': 'المزيد من القسم',
    'post.noSimilar': 'لا توجد إعلانات مشابهة حالياً.',
    'post.noAttributes': 'لا توجد خصائص متاحة لهذا الإعلان.',
    'post.attribute': 'الخاصية',
    'post.value': 'القيمة',
    'profile.user': 'مستخدم',
    'profile.editProfile': 'تعديل الملف الشخصي',
    'profile.shareProfile': 'مشاركة الملف الشخصي في رسالة',
    'profile.savePdf': 'حفظ الملف الشخصي بصيغة PDF',
    'profile.lockProfile': 'قفل الملف الشخصي',
    'profile.settings': 'إعدادات الملف الشخصي',
    'profile.aboutTitle': 'نبذة',
    'profile.aboutEmpty': 'أضف نبذة عنك ليراه الآخرون.',
    'profile.about.born': 'تاريخ الميلاد',
    'profile.about.email': 'البريد الإلكتروني',
    'profile.about.mobile': 'رقم الهاتف',
    'profile.about.username': 'اسم المستخدم',
    'profile.about.joined': 'تاريخ الانضمام',
    'profile.followsTitle': 'متابعاتك',
    'profile.followsHint': 'الأقسام والفئات والأشخاص الذين تتابعهم سيظهرون هنا قريباً.',
    'profile.tabs.feed': 'المنشورات',
    'profile.tabs.about': 'نبذة',
    'profile.tabs.activity': 'النشاط',
    'profile.tabs.statistics': 'الإحصائيات',
    'profile.noPosts': 'لا توجد منشورات بعد',
    'profile.postsError': 'فشل في تحميل منشوراتك',
    'profile.noImages': 'لا توجد صور بعد',
    'profile.imagesError': 'فشل في تحميل الصور',
    'profile.photos': 'الصور',
    'profile.photosLoading': 'جاري تحميل الصور...',
    'profile.stats.title': 'إحصائيات الملف الشخصي',
    'profile.stats.subtitle': 'ملخص شامل لأداء منشوراتك وتفاعلاتك',
    'profile.stats.totalPosts': 'إجمالي المنشورات',
    'profile.stats.activePosts': 'المنشورات النشطة',
    'profile.stats.deletedPosts': 'المنشورات المحذوفة',
    'profile.stats.comments': 'تعليقات على منشوراتي',
    'profile.stats.interactions': 'إجمالي التفاعلات',
    'profile.stats.breakdownTitle': 'تصنيف التفاعلات',
    'profile.stats.emptyBreakdown': 'لا توجد تفاعلات في هذه الفترة.',
    'profile.stats.dailyTitle': 'الأداء اليومي',
    'profile.stats.metricTitle': 'المؤشر',
    'profile.stats.chartLine': 'خطّي',
    'profile.stats.chartBar': 'أعمدة',
    'profile.stats.interactionsDaily': 'التفاعلات اليومية',
    'profile.stats.loadError': 'فشل في تحميل الإحصائيات',
    'profile.stats.statusBreakdown': 'تصنيف الحالات',
    'profile.stats.statusUnknown': 'غير محدد',
    'stats.title': 'إحصائيات الإعلان',
    'stats.subtitle': 'تحليل أداء الإعلان',
    'stats.backToPost': 'العودة للإعلان',
    'stats.from': 'من',
    'stats.to': 'إلى',
    'stats.apply': 'تطبيق',
    'stats.loading': 'جاري التحميل...',
    'stats.preset.7d': 'آخر 7 أيام',
    'stats.preset.30d': 'آخر 30 يوم',
    'stats.preset.90d': 'آخر 90 يوم',
    'stats.kpi.impressions': 'الظهور',
    'stats.kpi.uniqueImpressions': 'الظهور الفريد',
    'stats.kpi.views': 'مشاهدات التفاصيل',
    'stats.kpi.interactions': 'التفاعلات',
    'stats.kpi.calls': 'اتصالات',
    'stats.kpi.shares': 'مشاركات',
    'stats.kpi.chats': 'دردشات',
    'stats.tabs.overview': 'نظرة عامة',
    'stats.tabs.interactions': 'التفاعلات',
    'stats.tabs.audience': 'الجمهور',
    'stats.charts.viewsVsUnique': 'الظهور مقابل الظهور الفريد',
    'stats.charts.breakdown': 'توزيع الأحداث',
    'stats.charts.interactionsOverTime': 'التفاعلات عبر الزمن',
    'stats.hint.uniqueDefinition': 'الفريد = مستخدم/‏IP مختلف',
    'stats.top.userAgents': 'أكثر الأجهزة/المتصفحات',
    'stats.ua': 'User-Agent',
    'stats.count': 'العدد',
    'stats.noData': 'لا توجد بيانات',
    'stats.event.impressions': 'الظهور',
    'stats.event.views': 'مشاهدات التفاصيل',
    'stats.event.calls': 'اتصالات',
    'stats.event.shares': 'مشاركات',
    'stats.event.chats': 'دردشات',
    'stats.event.likes': 'إعجابات',
    'stats.event.unlikes': 'إلغاء إعجاب',
    'stats.event.comments': 'تعليقات',
    'dialog.loginRequired.title': 'تسجيل الدخول مطلوب',
    'dialog.loginRequired.message': 'يجب عليك تسجيل الدخول أولاً للوصول إلى هذه الميزة',
    'dialog.loginRequired.loginButton': 'تسجيل الدخول',
    'dialog.loginRequired.cancelButton': 'إلغاء',
    'dialog.emailVerify.title': 'تأكيد البريد الإلكتروني',
    'dialog.emailVerify.message': 'يجب تأكيد بريدك الإلكتروني قبل النشر أو التفاعل على الإعلانات.',
    'dialog.emailVerify.verifyButton': 'تأكيد البريد',
    'dialog.emailVerify.cancelButton': 'لاحقاً',
    'filter.filterResults': 'فلترة النتائج',
    'filter.filterDescription': 'المدينة، السعر، وخصائص الإعلان',
    'filter.close': 'إغلاق',
    'filter.reset': 'إعادة تعيين',
    'filter.city': 'المدينة',
    'filter.allCities': 'كل المدن',
    'filter.priceRange': 'نطاق السعر',
    'filter.from': 'من',
    'filter.to': 'إلى',
    'filter.postAttributes': 'خصائص الإعلان',
    'filter.apply': 'تطبيق',
    'filter.noAttributesAvailable': 'لا توجد خصائص متاحة لهذه الفئة.',
    'filter.selectField': 'اختر',
    'filter.postImages': 'صور المنشور',
    'filter.allPosts': 'كل المنشورات',
    'filter.withImages': 'منشورات بصور',
    'filter.withoutImages': 'منشورات بدون صور',
    'filter.sortBy': 'ترتيب النتائج',
    'filter.sortNewest': 'الأحدث',
    'filter.sortOldest': 'الأقدم',
    'filter.sortPriceLowToHigh': 'السعر من الأقل إلى الأعلى',
    'filter.sortPriceHighToLow': 'السعر من الأعلى إلى الأقل',
    'createPost.smartTitle': 'أنشئ إعلانك الذكي',
    'createPost.heroTitle': 'ابدأ إعلانك الذكي',
    'createPost.heroSubtitle': 'اكتب فكرتك، وسنقوم بتحويلها إعلان احترافي يجذب العملاء',
    'createPost.heroAddAd': 'أضف إعلان',
    'createPost.heroPlaceholder': '…اكتب هنا ما تريد بيعه',
    'createPost.heroTagTitle': 'عنوان جذاب',
    'createPost.heroTagDesc': 'وصف قوي',
    'createPost.heroTagPrice': 'سعر مناسب',
    'createPost.heroTagPhotos': 'صور مميزة',
    'createPost.launch': 'انطلق بإعلانك الذكي',
    'createPost.placeholder': 'ماذا تريد أن تبيع اليوم؟',
    'createPost.chipDemand': '🔥 طلب مرتفع في عمّان',
    'createPost.chipRoi': '📊 توقع عائد 82%',
    'createPost.chipTarget': '🎯 الفئة العمرية 25–34',
    'createPost.chipBudget': '💰 الميزانية المقترحة: $45',
    'createPost.wizard.step1': 'النص',
    'createPost.wizard.step2': 'الصور',
    'createPost.wizard.step3': 'القسم',
    'createPost.wizard.step4': 'الفئة',
    'createPost.wizard.step5': 'التفاصيل',
    'createPost.wizard.step6': 'النشر',
    'createPost.wizard.dynamicFields': 'حقول الإعلان',
    'createPost.wizard.lead':
      'ابدأ بعنوان واضح يصف ما تبيعه، ثم أضِف وصفاً يجيب عن الأسئلة الشائعة للمشترين.',
    'createPost.wizard.navPrev': 'رجوع',
    'createPost.wizard.navNext': 'متابعة',
    'createPost.wizard.navSubmit': 'نشر الإعلان',
    'createPost.wizard.navSubmitEdit': 'حفظ التعديلات',
    'createPost.wizard.navSubmitting': 'جاري النشر…',
    'createPost.edit.reviewNoticeTitle': 'تنبيه قبل الحفظ',
    'createPost.edit.reviewNoticeMessage':
      'عند حفظ التعديلات سيُعاد إعلانك إلى المراجعة ولن يظهر للزوار حتى توافق الإدارة عليه.',
    'createPost.edit.confirmTitle': 'إعادة الإعلان للمراجعة؟',
    'createPost.edit.confirmMessage':
      'حفظ هذه التعديلات سيُخفي الإعلان مؤقتاً عن الجميع حتى تتم مراجعته والموافقة عليه من جديد. هل تريد المتابعة؟',
    'createPost.edit.confirmContinue': 'نعم، احفظ وأرسل للمراجعة',
    'createPost.edit.confirmCancel': 'إلغاء',
    'createPost.photos.title': 'صور الإعلان',
    'createPost.photos.hint':
      'أضف حتى 5 صور واضحة (JPG أو PNG أو WebP). الحد الأقصى 5 ميجابايت لكل صورة. الصور تُرفق عند نشر أو تحديث الإعلان.',
    'createPost.photos.savedTitle': 'صور محفوظة على السيرفر',
    'createPost.photos.savedHint': 'تظهر في إعلانك الحالي. يمكنك حذف أي منها قبل الحفظ.',
    'createPost.photos.newTitle': 'صور جديدة للإرسال',
    'createPost.photos.badgeSuffix': 'صورة للإرسال',
    'createPost.photos.dropHint': 'اسحب الصور هنا أو استخدم «إضافة صور».',
    'createPost.photos.dropActive': 'أفلت لإضافة الصور…',
    'createPost.photos.addSlot': 'إضافة صور',
    'createPost.photos.removeAria': 'إزالة من القائمة',
    'createPost.photos.deleteSaved': 'حذف من الإعلان',
    'createPost.photos.deleting': 'جارٍ الحذف…',
    'createPost.photos.rules': 'JPG · PNG · WebP — حتى 5 ميجابايت لكل ملف — 5 صور كحد أقصى.',
    'createPost.photos.confirmDelete': 'هل تريد حذف هذه الصورة من الإعلان؟',
    'createPost.photos.deleteFailed': 'تعذّر حذف الصورة',
    'createPost.photos.errTooLarge': 'ملف أكبر من 5 ميجابايت تم تجاهله.',
    'createPost.photos.errBadType': 'يُقبل فقط JPG أو PNG أو WebP.',
    'createPost.photos.errSlotsFull': 'وصلتَ إلى الحد الأقصى (5 صور). احذف صورة لإضافة أخرى.',
    'createPost.photos.errSomeSkipped': 'بعض الملفات لم تُضف لأن العدد بلغ الحد الأقصى.',
    'createPost.success.celebrationTitle': '🎉 نشر ناجح!',
    'createPost.success.celebrationSubtitle': 'أصبح إعلانك متاحاً. يمكنك مشاهدته أو العثور عليه في قائمة إعلاناتك.',
    'createPost.success.pendingTitle': 'تم إرسال إعلانك للمراجعة',
    'createPost.success.pendingSubtitle': 'سيظهر إعلانك للجميع بعد موافقة الإدارة. يمكنك متابعته من قائمة إعلاناتك.',
    'createPost.success.viewMyAds': 'قائمة إعلاناتي',
    'createPost.success.viewPost': 'مشاهدة الإعلان',
    'createPost.success.viewFeed': 'الانتقال لقائمة إعلاناتي',
    'createPost.success.viewHomeFeed': 'الانتقال لتغذية الرئيسية',
    'createPost.success.close': 'متابعة التصفح',
    'createPost.success.updated': 'تم تحديث الإعلان بنجاح',
    'createPost.success.updatedPending':
      'تم حفظ التعديلات وإعادة إرسال الإعلان للمراجعة. سيظهر بعد موافقة الإدارة.',
    'createPost.rateLimit.title': 'يرجى الانتظار قبل نشر إعلان جديد',
    'createPost.rateLimit.checking': 'جاري التحقق من إمكانية النشر…',
    'createPost.rateLimit.intervalHint': 'يمكنك نشر إعلان واحد كل {minutes} دقائق.',
    'createPost.rateLimit.hourlyHint': 'نشرت {count} من {max} إعلانات مسموحة خلال الساعة الأخيرة.',
    'createPost.rateLimit.countdownLabel': 'يمكنك النشر بعد',
    'createPost.rateLimit.verificationHint': 'وثّق حسابك للنشر بدون قيود انتظار.',
    'createPost.rateLimit.requestVerification': 'طلب توثيق الحساب',
    'createPost.rateLimit.requestVerificationSubmitting': 'جاري إرسال الطلب…',
    'createPost.rateLimit.requestVerificationPending': 'طلبك قيد المراجعة',
    'createPost.rateLimit.requestVerificationRetry': 'إعادة طلب التوثيق',
    'createPost.rateLimit.requestVerificationFailed': 'تعذّر إرسال طلب التوثيق',
    'auction.searchPlaceholder': 'ابحث عن أي شيء...',
    'auction.postAd': 'أضف إعلان',
    'auction.boost': 'تعزيز',
    'auction.chip.updates': 'تحديثات',
    'auction.chip.lives': 'مباشر',
    'auction.chip.hotDeals': 'عروض ساخنة',
    'auction.chip.auctions': 'مزادات',
    'auction.tab.realEstate': 'عقارات',
    'auction.tab.furniture': 'أثاث',
    'auction.tab.electronics': 'إلكترونيات',
    'auction.tab.auctions': 'مزادات',
    'auction.trending.title': 'إعلانات رائجة',
    'auction.trending.hint': 'الأكثر مشاهدة اليوم',
    'auction.trending.cars': 'سيارات',
    'auction.trending.villa': 'فيلا مفروشة',
    'auction.trending.brand': 'ماركات',
    'auction.trending.boost': 'إعلان مميز',
    'auction.trending.metaNew': 'جديد • 03',
    'auction.trending.metaHot': 'ساخن • 00',
    'auction.trending.metaNow': 'الآن • 18',
    'auction.trending.metaPromo': 'ترويج',
    'auction.live.title': 'مزادات مباشرة',
    'auction.live.hint': 'زايد الآن ونافس الآخرين',
    'auction.live.endsIn': 'ينتهي خلال',
    'auction.live.bids': 'مزايدات',
    'auction.live.currentPrice': 'السعر الحالي',
    'auction.live.secure': 'دفع آمن',
    'auction.live.bidNow': 'زايد الآن',
    'auction.live.showcase': 'عرض شامل',
    'auction.live.tires': 'إطارات',
    'auction.live.shoes': 'أحذية',
    'auction.live.tools': 'أدوات',
    'auction.panel.title': 'لوحة سريعة',
    'auction.panel.hint': 'أنشئ إعلانك في خطوات بسيطة',
    'auction.panel.chooseCategory': 'اختر القسم',
    'auction.panel.typeCategory': 'اكتب اسم القسم...',
    'auction.panel.go': 'ابدأ',
    'auction.panel.uploadMedia': 'رفع الصور',
    'auction.panel.dragDrop': 'اسحب وأفلت أو اضغط للرفع',
    'auction.panel.upload': 'رفع',
    'auction.step.start': 'ابدأ',
    'auction.step.next': 'التالي',
    'auction.step.done': 'تم',
    'auction.step1.title': 'اختيار القسم',
    'auction.step1.desc': 'اختر القسم المناسب لظهور أفضل',
    'auction.step2.title': 'السعر والموقع',
    'auction.step2.desc': 'حدد السعر والمدينة بسهولة',
    'auction.step3.title': 'باقة مميزة',
    'auction.step3.desc': 'تعزيز الظهور وزيادة التفاعل',
    'auction.step4.title': 'نشر الإعلان',
    'auction.step4.desc': 'راجع التفاصيل وانشر خلال ثوانٍ',
    'auction.publish': 'نشر الإعلان',
    'auctionPosts.brandGuide': 'دليل هوية العلامة',
    'auctionPosts.heroTitle': 'ANANAS',
    'auctionPosts.heroSubtitle': 'Brand Style Guide',
    'auctionPosts.trendingTitle': 'إعلانات رائجة',
    'auctionPosts.trending.pill': 'أناناس',
    'auctionPosts.trending.badgeAd': 'إعلان',
    'auctionPosts.trending.like': 'إعجاب',
    'auctionPosts.trending.live': 'مباشر',
    'auctionPosts.trending.card2.line1': 'Rirkuit',
    'auctionPosts.trending.card2.line2': 'DNQic9 9od',
    'auctionPosts.trending.card3.line1': 'Dw9aor',
    'auctionPosts.trending.card3.line2': 'DNQN09 9od',
    'auctionPosts.livePackageTitle': 'حزمة مزادات مباشرة',
    'auctionPosts.postAdTitle': 'أضف إعلان',
    'auctionPosts.postAdDesc': 'مرح لكن احترافي. شخصيات ودودة بطابع تقني عصري. مناسب للشرق الأوسط، جاهز للتميّز.',
    'auctionPosts.tag.popular': 'شائع',
    'auctionPosts.tag.live': 'مباشر',
    'auctionPosts.tag.brand': 'برانـد',
    'auctionPosts.cta.bid': 'زايد',
    'auctionPosts.cta.boostAd': 'تعزيز الإعلان',
    'auctionPosts.live.card1.title': 'Vies Title',
    'auctionPosts.live.card1.topTitle': 'Upload',
    'auctionPosts.live.card1.topSub': '5 rotate',
    'auctionPosts.live.card1.desc': 'محتوى مناسب للبداية',
    'auctionPosts.live.card2.title': 'Tiree Title',
    'auctionPosts.live.card2.topTitle': 'Boost Ad',
    'auctionPosts.live.card2.topSub': '33:00',
    'auctionPosts.live.card2.desc': 'محتوى متنوع وإعلان مميز',
    'auctionPosts.live.card3.title': 'Live a Title',
    'auctionPosts.live.card3.desc': 'محتوى مباشر لمزيد من التفاعل',
    'auctionPosts.small.new': 'جديد',
    'auctionPosts.small.likes': 'الإعجابات',
    'auctionPosts.small.boost': 'Boost Ad',
    'auctionPosts.small.view': 'عرض',
    'auctionPosts.small.recommended': 'موصى به',
    'auctionPosts.small.sponsored': 'ممول',
    'auctionPosts.small.live': 'مباشر',
    'auctionPosts.small.captions': 'عناوين',
    'auctionPosts.live.pill.community': 'مجتمع',
    'auctionPosts.live.priceNote.bid': 'مزايدة',
    'auctionPosts.live.priceNote.shares': 'مشاهدات / مشاركات',
    'auctionPosts.live.unit.rma': 'rma',
    'auctionPosts.live.footerNote.a': '$40  $40',
    'auctionPosts.live.footerNote.b': '$40  $40',
    'auctionPosts.live.footerNote.c': '$40  $40',
    'auctionPosts.live.bio': 'نبذة',
    'auctionPosts.live.col1.k': 'feictuh',
    'auctionPosts.live.col1.v': '$0.35',
    'auctionPosts.live.col2.k': 'rotordemse',
    'auctionPosts.live.col2.v': 'sflove',
    'notifications.title': 'الإشعارات',
    'notifications.subtitle': 'كل ما يخصّك في مكان واحد',
    'notifications.empty': 'لا توجد إشعارات بعد',
    'notifications.emptyHint': 'سنخبرك هنا فور وصول رسالة، تعليق، أو تحديث على حسابك.',
    'notifications.viewAll': 'عرض الكل',
    'notifications.markAll': 'تحديد الكل كمقروء',
    'notifications.markAllShort': 'تعليم الكل',
    'notifications.unreadOne': 'إشعار واحد غير مقروء',
    'notifications.unreadFew': 'إشعارات غير مقروءة',
    'notifications.allCaughtUp': 'لقد اطّلعت على كل شيء',
    'notifications.loading': 'جارٍ التحميل…',
    'notifications.justNow': 'الآن',
    'notifications.openBell': 'فتح الإشعارات',
    'notifications.closeBell': 'إغلاق الإشعارات',
    'notifications.newBadge': 'جديد',
    'realtime.newPost.title': 'إعلان جديد للتو',
    'realtime.newPost.subtitle': 'تم نشر إعلان جديد على منصة اناناس',
    'realtime.newPost.viewNow': 'عرض الإعلان',
    'realtime.newPost.dismiss': 'إغلاق',
    'realtime.newPost.disable': 'إيقاف هذه التنبيهات',
    'realtime.newPost.disabledHint': 'تم إيقاف تنبيهات الإعلانات الجديدة',
    'realtime.newPost.enable': 'تفعيل التنبيهات',
    'realtime.newPost.justNow': 'الآن',
    'realtime.newPost.byAuthor': 'بواسطة',
    'realtime.newPost.pushedBadge': 'جديد · بُثّ مباشر',
    'realtime.newPost.justArrived': 'وصل للتو',

    // Messaging
    'messaging.title': 'المراسلات',
    'messaging.searchPlaceholder': 'ابحث في المحادثات...',
    'messaging.empty': 'لا توجد محادثات بعد',
    'messaging.emptyHint': 'تواصل مع المعلنين عبر صفحات الإعلانات وستظهر محادثاتك هنا.',
    'messaging.noConversations': 'لا توجد محادثات مطابقة',
    'messaging.startConversation': 'ابدأ محادثة جديدة',
    'messaging.selectConversation': 'اختر محادثة من القائمة',
    'messaging.selectConversationHint': 'تواصل مباشرةً مع المعلنين، تابع رسائلك، وأدِر محادثاتك من مكان واحد.',
    'messaging.online': 'متصل الآن',
    'messaging.offline': 'غير متصل',
    'messaging.typing': 'يكتب الآن...',
    'messaging.you': 'أنت',
    'messaging.justNow': 'الآن',
    'messaging.minutesAgo': 'منذ {n} دقيقة',
    'messaging.hoursAgo': 'منذ {n} ساعة',
    'messaging.daysAgo': 'منذ {n} يوم',
    'messaging.yesterday': 'الأمس',
    'messaging.today': 'اليوم',
    'messaging.composerPlaceholder': 'اكتب رسالة...',
    'messaging.send': 'إرسال',
    'messaging.attach': 'إرفاق ملف',
    'messaging.emoji': 'إيموجي',
    'messaging.composerDisabledClosed': 'هذه المحادثة مغلقة — لم يعد بالإمكان إرسال رسائل.',
    'messaging.composerDisabledBlocked': 'لم يعد بالإمكان إرسال رسائل في هذه المحادثة.',
    'messaging.viewPost': 'عرض الإعلان',
    'messaging.linkedPost': 'الإعلان المرتبط',
    'messaging.postId': 'إعلان رقم',
    'messaging.menu': 'القائمة',
    'messaging.actions.markRead': 'تحديد كمقروء',
    'messaging.actions.viewProfile': 'عرض الملف الشخصي',
    'messaging.actions.viewPost': 'الانتقال للإعلان',
    'messaging.actions.clear': 'مسح المحادثة',
    'messaging.actions.close': 'إغلاق المحادثة',
    'messaging.actions.reopen': 'إعادة فتح المحادثة',
    'messaging.actions.block': 'حظر المستخدم',
    'messaging.actions.unblock': 'إلغاء الحظر',
    'messaging.actions.report': 'الإبلاغ عن المحادثة',
    'messaging.actions.delete': 'حذف المحادثة',
    'messaging.confirm.clearTitle': 'مسح هذه المحادثة؟',
    'messaging.confirm.clearBody': 'سيتم إخفاء جميع الرسائل من نسختك. الطرف الآخر سيظل يرى محادثته.',
    'messaging.confirm.closeTitle': 'إغلاق المحادثة؟',
    'messaging.confirm.closeBody': 'لن يتمكن أي من الطرفين من إرسال رسائل جديدة بعد الإغلاق.',
    'messaging.confirm.blockTitle': 'حظر هذا المستخدم؟',
    'messaging.confirm.blockBody': 'لن يتمكن من إرسال رسائل لك في هذه المحادثة.',
    'messaging.confirm.deleteTitle': 'حذف المحادثة؟',
    'messaging.confirm.deleteBody': 'سيتم إخفاء المحادثة من قائمتك. الطرف الآخر سيستمر بالوصول إليها.',
    'messaging.confirm.confirm': 'تأكيد',
    'messaging.confirm.cancel': 'إلغاء',
    'messaging.report.title': 'الإبلاغ عن المحادثة',
    'messaging.report.subtitle': 'سيتم مراجعة بلاغك من فريق الإشراف. شكراً لمساعدتنا في الحفاظ على بيئة آمنة.',
    'messaging.report.categoryLabel': 'تصنيف البلاغ',
    'messaging.report.category.spam': 'سبام / إعلانات مزعجة',
    'messaging.report.category.harassment': 'تحرّش / مضايقة',
    'messaging.report.category.scam': 'احتيال',
    'messaging.report.category.inappropriate': 'محتوى غير لائق',
    'messaging.report.category.other': 'سبب آخر',
    'messaging.report.reasonLabel': 'سبب البلاغ',
    'messaging.report.reasonPlaceholder': 'اكتب سبب البلاغ بإيجاز...',
    'messaging.report.descriptionLabel': 'تفاصيل إضافية (اختياري)',
    'messaging.report.descriptionPlaceholder': 'أضف أي تفاصيل تساعدنا في فهم الموقف...',
    'messaging.report.submit': 'إرسال البلاغ',
    'messaging.report.submitting': 'جارٍ الإرسال...',
    'messaging.report.success': 'تم استلام البلاغ. سيقوم الفريق بمراجعته.',
    'messaging.report.error': 'تعذّر إرسال البلاغ. حاول مرة أخرى.',
    'messaging.banner.closed': 'المحادثة مغلقة',
    'messaging.banner.blockedByYou': 'لقد قمت بحظر هذا المستخدم',
    'messaging.banner.blockedByOther': 'لم يعد بالإمكان إرسال رسائل في هذه المحادثة',
    'messaging.banner.cleared': 'تم مسح هذه المحادثة من نسختك',
    'messaging.banner.connecting': 'جارٍ الاتصال...',
    'messaging.banner.live': 'مباشر',
    'messaging.banner.polling': 'وضع المزامنة الدورية',
    'messaging.errors.send': 'تعذّر إرسال الرسالة',
    'messaging.errors.load': 'تعذّر تحميل المحادثات',
    'messaging.unread': 'جديدة',
    'messaging.delivered': 'تم التسليم',
    'messaging.seen': 'تمت القراءة',
    'messaging.sent': 'مُرسَلة',
    'messaging.sending': 'جارٍ الإرسال...',
    'messaging.failed': 'فشل الإرسال',
    'messaging.retry': 'إعادة المحاولة',
    'notFound.badge': 'تنبيه: الصفحة غير موجودة',
    'notFound.title': 'هذه الصفحة غير موجودة',
    'notFound.lead':
      'قد يكون الرابط معطلاً أو أُزيلت الصفحة. يمكننا إعادتك إلى الصفحة الرئيسية.',
    'notFound.backHome': 'العودة للصفحة الرئيسية',
    'notFound.siteName': 'اناناس',
    'selectCountry.metaTitle': 'اختر دولتك | أناناس — إعلانات وتسويق ورقمية في الوطن العربي',
    'selectCountry.metaDescription':
      'اختر بلدك للانتقال إلى نسخة أناناس المحلية: إعلانات مبوبة، منشورات، ورسائل بأمانة السوق واللغة المناسبة. تصفح الأردن، مصر، السعودية، الإمارات والدول المتاحة.',
    'selectCountry.h1': 'اختر دولتك للمتابعة على أناناس',
    'selectCountry.lead':
      'كل دولة لها نسخة مخصّصة من المنصة (محتوى محلي، عملة، ومدن). اختر بلدك من القائمة أدناه للانتقال مباشرة إلى الموقع الفرعي الصحيح.',
    'selectCountry.intro':
      'أناناس منصة إعلانات وتجارة رقمية في المنطقة. اختيار الدولة يضمن لك نتائج أقرب لموقعك وقوانين السوق المحلية.',
    'selectCountry.listTitle': 'الدول المتاحة',
    'selectCountry.cardCta': 'الدخول إلى نسخة الدولة',
    'selectCountry.cardHint': 'يفتح الموقع الفرعي لهذه الدولة في نافذة التصفح الحالية.',
    'selectCountry.isoLabel': 'رمز الدولة',
    'selectCountry.empty': 'لا توجد دول متاحة حالياً. يرجى المحاولة لاحقاً.',
    'selectCountry.switchToEn': 'English',
    'selectCountry.switchToAr': 'العربية',
    'selectCountry.langSwitchAria': 'تبديل لغة الصفحة',
    'selectCountry.skipToList': 'تخطي إلى قائمة الدول',
    'selectCountry.breadcrumbHome': 'الرئيسية',
    'selectCountry.breadcrumbCurrent': 'اختيار الدولة',
  },
  en: {
    'home.noSections': 'No sections available at the moment',
    'home.viewProfile': 'View Profile',
    'home.aboutUs': 'About Us',
    'home.settings': 'Settings',
    'home.support': 'Support',
    'home.feedback': 'Feedback',
    'home.help': 'Help',
    'home.privacyTerms': 'Privacy & Terms',
    'home.todaysNews': "Today's News",
    'home.viewAllLatestNews': 'View all latest news',
    'home.seo.title': 'ANANAS — digital classifieds, ads & commerce in {{country}}',
    'home.seo.description':
      'Discover listings, posts, and market activity in {{country}} on ANANAS. Browse sections, market pulse, and connect with sellers safely.',
    'home.seo.regionFallback': 'your region',
    'home.seo.keywords':
      'ANANAS, classifieds, digital ads, e-commerce, marketplace, {{country}}, listings, buy, sell',
    'home.a11y.visuallyHiddenTitle': 'Home — ANANAS in {{country}}',
    'seo.home.feedListings': 'Latest listings and posts',
    'seo.section.categories': 'Section categories',
    'seo.section.listings': '{{name}} listings',
    'seo.category.listings': '{{name}} listings',
    'seo.search.results': 'Search results',
    'seo.sidebar.sectionsMap': 'Site section map',
    'home.marketPulse': 'Market Pulse',
    'home.marketPulseEmpty': 'No sections with at least +1% growth in the last 30 days vs the previous 30 days.',
    'home.marketPulseGrowth': 'Growth',
    'home.trendingEmpty': 'No standout posts by engagement in your country right now.',
    'home.trendingEngagementHint': 'Comments & reactions',
    'home.cars': 'Cars',
    'home.realEstate': 'Real Estate',
    'home.electronics': 'Electronics',
    'home.jobs': 'Jobs',
    'home.topPerformingAds': 'Top Performing Ads Today',
    'home.latestAds': 'Latest ads',
    'home.latestAdsEmpty': 'No new listings yet.',
    'home.newBadge': 'New',
    'home.ad.zamzam': 'Zamzam Zaman',
    'home.ad.movingHouse': 'Moving House Company',
    'home.ad.othman': 'Othman Real Estate',
    'home.ad.electronics': 'Eitenzaz Electronics',
    'home.ad.elite': 'EliteRez Electronics',
    'home.ad.tech': 'Tech Vibes',
    'home.smartOpportunity': 'Smart Opportunity Alerts',
    'home.highRoi': '3 High ROI Niches',
    'home.detectedInAmman': 'Detected in Amman',
    'home.activateOpportunity': 'Activate Opportunity',
    'home.ananasVsOthers': 'ANANAS vs. Others',
    'home.listings': 'Listings',
    'home.marketplace': 'Marketplace',
    'home.classifieds': 'Classifieds',
    'home.aiEngine': 'AI Advertising Engine',
    'home.futureRoadmap': 'Future Roadmap',
    'home.comingSoon': 'Coming soon',
    'home.roadmap.pro': 'Ananas Pro – Advanced AI Tools',
    'home.roadmap.gold': 'Ananas Gold – VIP Exposure Engine',
    'home.roadmap.family': 'Ananas Family – Family Rewards',
    'home.aiInfra.title': 'AI Infrastructure',
    'home.aiInfra.headerPill': 'Tapiz: 2 gigs',
    'home.aiInfra.feature1.title': 'AI Forecast Engine',
    'home.aiInfra.feature1.desc': 'Predicts 7-day demand',
    'home.aiInfra.feature2.title': 'Smart Boost 3.0',
    'home.aiInfra.feature2.desc': 'Auto visibility scaling',
    'home.aiInfra.feature3.title': 'Live Auction Engine',
    'home.aiInfra.feature3.desc': 'Real-time bid placement',
    'home.aiInfra.feature4.title': 'Audience DNA',
    'home.aiInfra.feature4.desc': 'Behavior clustering',
    'home.aiInfra.cars': 'Cars',
    'home.aiInfra.realEstate': 'Real Estate',
    'home.aiInfra.jobs': 'Jobs',
    'home.aiInfra.electronics': 'Electronics',
    'home.aiInfra.trending': 'Trending',
    'home.quickLinks': 'Quick links',
    'home.quick.auction.title': 'Auction experience',
    'home.quick.auction.hint': 'Interactive, modern UI',
    'home.quick.auctionPosts.title': 'Auction posts experience',
    'home.quick.auctionPosts.hint': 'Cards, badges & highlights',
    'home.elite.title': 'Elite – Reach 1M+ Smart',
    'home.elite.b1': 'Enhanced ranking',
    'home.elite.b2': 'Early auction access',
    'home.elite.b3': 'Auction integrity',
    'home.elite.cta': 'Upgrade to Elite',
    'home.elite.coming': 'COMING SOON',
    'home.pro.title': 'Ananas Pro',
    'home.pro.b1': 'Advanced AI Tools',
    'home.pro.b2': 'VIP Exposure Engine',
    'home.pro.b3': 'Multi Account Business',
    'sidebar.noSections': 'No sections available at the moment',
    'sidebar.panelTitle': 'Listing sections',
    'sidebar.panelHint': 'Pick a section to jump into the listings you care about',
    'sidebar.sectionTeaser': 'Looking for «{{section}}»? Tap here',
    'sidebar.viewProfile': 'View Profile',
    'sidebar.aboutUs': 'About Us',
    'sidebar.settings': 'Settings',
    'sidebar.support': 'Support',
    'sidebar.feedback': 'Feedback',
    'sidebar.help': 'Help',
    'sidebar.privacyTerms': 'Privacy & Terms',
    'sidebar.contactUs': 'Contact Us',
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Send us your message and we will get back to you as soon as possible.',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.submit': 'Send',
    'contact.submitting': 'Sending...',
    'contact.success': 'Your message was sent successfully. Thank you for reaching out.',
    'contact.error': 'Could not send your message. Please try again.',
    'contact.nameRequired': 'Please enter your name',
    'contact.emailRequired': 'Please enter your email',
    'contact.emailInvalid': 'Please enter a valid email address',
    'contact.subjectRequired': 'Please enter a subject',
    'contact.messageRequired': 'Please enter your message',
    'contact.rateLimited': 'Too many attempts. Please wait a moment and try again.',
    'emailVerify.title': 'Verify your email',
    'emailVerify.subtitle': 'You must verify your email before posting or interacting with listings.',
    'emailVerify.sentTo': 'We sent a verification code to:',
    'emailVerify.codeLabel': 'Verification code',
    'emailVerify.codePlaceholder': '000000',
    'emailVerify.verify': 'Verify',
    'emailVerify.verifying': 'Verifying...',
    'emailVerify.resend': 'Resend code',
    'emailVerify.resending': 'Sending...',
    'emailVerify.changeEmail': 'Change email address',
    'emailVerify.newEmail': 'New email',
    'emailVerify.updateEmail': 'Update & send new code',
    'emailVerify.success': 'Your email has been verified!',
    'emailVerify.error': 'Could not complete the action. Please try again.',
    'emailVerify.codeRequired': 'Please enter the verification code',
    'emailVerify.emailRequired': 'Please enter your email',
    'emailVerify.emailInvalid': 'Please enter a valid email address',
    'emailVerify.signOut': 'Sign out',
    'emailVerify.hint': 'Check your inbox or spam folder for the code.',
    'auth.welcome': 'Welcome to Ananas Advertising Platform',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Create a new account now',
    'auth.createAccount': 'Create Account',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.clickToSignUp': 'Click here to sign up',
    'auth.clickToSignIn': 'Sign in here',
    'auth.emailOrPhone': 'Email (or Phone Number)',
    'auth.enterEmailOrPhone': 'Enter your email (or phone number)',
    'auth.password': 'Password',
    'auth.enterPassword': 'Enter your password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.enterConfirmPassword': 'Enter password confirmation',
    'auth.rememberMe': 'Remember me?',
    'auth.forgotPassword': 'Forgot password?',
    'auth.forgotPassTitle': 'Reset Password',
    'auth.forgotPassDesc': 'Enter your email and we\'ll send you a reset link.',
    'auth.sendResetLink': 'Send reset link',
    'auth.sending': 'Sending...',
    'auth.checkEmail': 'Check your email',
    'auth.checkEmailDesc': 'If an account exists for this email, you will receive a password reset link.',
    'auth.backToSignIn': 'Back to sign in',
    'auth.resetPassTitle': 'Set new password',
    'auth.resetPassDesc': 'Enter your new password and confirmation.',
    'auth.newPassword': 'New password',
    'auth.enterNewPassword': 'Enter new password',
    'auth.resetPassword': 'Reset password',
    'auth.resetting': 'Resetting...',
    'auth.resetSuccess': 'Password has been reset. You can sign in now.',
    'auth.resetLinkExpired': 'Reset link has expired. Please request a new one.',
    'auth.submit': 'Sign In',
    'auth.signingIn': 'Signing in...',
    'auth.creating': 'Creating...',
    'auth.name': 'Name',
    'auth.enterName': 'Enter your name',
    'auth.mobile': 'Phone Number',
    'auth.enterMobile': 'Enter your phone number',
    'auth.email': 'Email',
    'auth.enterEmail': 'Enter your email',
    'auth.nameOptional': 'Name (Optional)',
    'auth.mobileOptional': 'Phone Number (Optional)',
    'auth.emailOptional': 'Email (Optional)',
    'auth.allRightsReserved': 'All rights reserved',
    'auth.terms': 'Terms',
    'auth.privacy': 'Privacy',
    'auth.cookies': 'Cookies',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.passwordRequired': 'Enter password',
    'auth.passwordMinLength': 'Password must be at least 8 characters',
    'auth.nameRequired': 'Name is required',
    'auth.emailRequired': 'Email is required',
    'auth.nameMaxLength': 'Name must not exceed 255 characters',
    'auth.confirmPasswordRequired': 'Enter password confirmation',
    'auth.invalidEmail': 'Enter a valid email address',
    'post.editPost': 'Edit Post',
    'post.deletePost': 'Delete Post',
    'post.confirmDelete': 'Are you sure you want to delete this post?',
    'post.user': 'User',
    'post.you': 'You',
    'post.readMore': 'Read more',
    'post.addComment': 'Add a comment...',
    'post.loginToComment': 'Sign in to add a comment',
    'post.loginRequired': 'Login Required',
    'post.cannotCommentWithoutLogin': 'You cannot comment without signing in',
    'post.loadMoreComments': 'Load more comments',
    'post.viewMoreComments': 'View more comments',
    'post.contact': 'Contact',
    'post.sendEmail': 'Send Email',
    'post.noContactData': 'No contact data',
    'post.watchOnAnanas': 'Watch on Ananas Platform',
    'post.failedToOpenChat': 'Failed to open chat',
    'post.pleaseTryAgain': 'Please try again.',
    'post.errorDeletingPost': 'An error occurred while deleting the post',
    'post.viewAll': 'View all',
    'post.liked': 'Liked',
    'post.like': 'Like',
    'post.comment': 'Comment',
    'post.share': 'Share',
    'post.chat': 'Chat',
    'post.openChat': 'Open Chat',
    'post.loginToChat': 'Sign in to chat',
    'post.commentAction': 'Comment',
    'post.reply': 'Reply',
    'post.viewReplies': 'View replies',
    'post.writeReply': 'Write a reply...',
    'post.send': 'Send',
    'post.loadingReplies': 'Loading replies...',
    'post.loadMoreReplies': 'Load more replies',
    'post.unlike': 'Unlike',
    'post.likeComment': 'Like',
    'post.statistics': 'Ad Statistics',
    'post.detailsTitle': 'Ad Details',
    'post.similarTitle': 'Similar listings',
    'post.report.menu': 'Report listing',
    'post.report.title': 'Report this listing',
    'post.report.subtitle': 'Choose a reason. Our moderation team will review it. You can report each listing only once.',
    'post.report.categoryLabel': 'Report reason',
    'post.report.category.spam': 'Spam',
    'post.report.category.harassment': 'Harassment',
    'post.report.category.scam': 'Scam',
    'post.report.category.inappropriate': 'Inappropriate content',
    'post.report.category.other': 'Other',
    'post.report.reasonLabel': 'Short description',
    'post.report.reasonPlaceholder': 'Briefly describe the issue...',
    'post.report.descriptionLabel': 'Additional details (optional)',
    'post.report.descriptionPlaceholder': 'Anything that helps our moderators...',
    'post.report.submit': 'Submit report',
    'post.report.submitting': 'Submitting...',
    'post.report.cancel': 'Cancel',
    'post.report.success': 'Report received. The team will review it.',
    'post.report.error': 'Could not submit your report. Please try again.',
    'post.report.loginRequired': 'Please sign in to report this listing.',
    'post.notFound.title': 'This ad is unavailable',
    'post.notFound.lead': 'It may have been removed, is still under review, or the link is incorrect.',
    'post.notFound.leadWithId': 'Ad #{id} is unavailable. It may have been removed, is pending approval, or the link is wrong.',
    'post.notFound.mightInterestYou': 'You might like',
    'post.notFound.noSuggestions': 'No suggested ads in your country right now.',
    'post.statusBanner.pendingReview.title': 'Under review',
    'post.statusBanner.pendingReview.message':
      'Your ad is awaiting admin approval. Only you can see it until it is published.',
    'post.statusBanner.rejected.title': 'Rejected',
    'post.statusBanner.rejected.message':
      'This ad was not approved. You can edit and resubmit. Only you can see it.',
    'post.moreFromSection': 'More from this section',
    'post.noSimilar': 'No similar listings right now.',
    'post.noAttributes': 'No attributes are available for this ad.',
    'post.attribute': 'Attribute',
    'post.value': 'Value',
    'profile.user': 'User',
    'profile.editProfile': 'Edit profile',
    'profile.shareProfile': 'Share profile in a message',
    'profile.savePdf': 'Save your profile to PDF',
    'profile.lockProfile': 'Lock profile',
    'profile.settings': 'Profile settings',
    'profile.aboutTitle': 'About',
    'profile.aboutEmpty': 'Add a short bio so others can learn about you.',
    'profile.about.born': 'Date of birth',
    'profile.about.email': 'Email',
    'profile.about.mobile': 'Phone number',
    'profile.about.username': 'Username',
    'profile.about.joined': 'Joined on',
    'profile.followsTitle': 'Your follows',
    'profile.followsHint': 'Sections, categories, and people you follow will appear here soon.',
    'profile.tabs.feed': 'Feed',
    'profile.tabs.about': 'About',
    'profile.tabs.activity': 'Activity',
    'profile.tabs.statistics': 'Statistics',
    'profile.noPosts': 'No posts yet',
    'profile.postsError': 'Failed to load your posts',
    'profile.noImages': 'No images yet',
    'profile.imagesError': 'Failed to load images',
    'profile.photos': 'Photos',
    'profile.photosLoading': 'Loading photos...',
    'profile.stats.title': 'Profile Statistics',
    'profile.stats.subtitle': 'A complete overview of your posts and interactions',
    'profile.stats.totalPosts': 'Total posts',
    'profile.stats.activePosts': 'Active posts',
    'profile.stats.deletedPosts': 'Deleted posts',
    'profile.stats.comments': 'Comments on my posts',
    'profile.stats.interactions': 'Total interactions',
    'profile.stats.breakdownTitle': 'Interactions breakdown',
    'profile.stats.emptyBreakdown': 'No interactions in this period.',
    'profile.stats.dailyTitle': 'Daily performance',
    'profile.stats.metricTitle': 'Metric',
    'profile.stats.chartLine': 'Line',
    'profile.stats.chartBar': 'Bar',
    'profile.stats.interactionsDaily': 'Daily interactions',
    'profile.stats.loadError': 'Failed to load statistics',
    'profile.stats.statusBreakdown': 'Status breakdown',
    'profile.stats.statusUnknown': 'Unknown',
    'stats.title': 'Ad Statistics',
    'stats.subtitle': 'Analyze ad performance',
    'stats.backToPost': 'Back to ad',
    'stats.from': 'From',
    'stats.to': 'To',
    'stats.apply': 'Apply',
    'stats.loading': 'Loading...',
    'stats.preset.7d': 'Last 7 days',
    'stats.preset.30d': 'Last 30 days',
    'stats.preset.90d': 'Last 90 days',
    'stats.kpi.impressions': 'Impressions',
    'stats.kpi.uniqueImpressions': 'Unique impressions',
    'stats.kpi.views': 'Detail views',
    'stats.kpi.interactions': 'Interactions',
    'stats.kpi.calls': 'Calls',
    'stats.kpi.shares': 'Shares',
    'stats.kpi.chats': 'Chats',
    'stats.tabs.overview': 'Overview',
    'stats.tabs.interactions': 'Interactions',
    'stats.tabs.audience': 'Audience',
    'stats.charts.viewsVsUnique': 'Impressions vs Unique',
    'stats.charts.breakdown': 'Events breakdown',
    'stats.charts.interactionsOverTime': 'Interactions over time',
    'stats.hint.uniqueDefinition': 'Unique = distinct user / IP',
    'stats.top.userAgents': 'Top devices/browsers',
    'stats.ua': 'User-Agent',
    'stats.count': 'Count',
    'stats.noData': 'No data',
    'stats.event.impressions': 'Impressions',
    'stats.event.views': 'Detail views',
    'stats.event.calls': 'Calls',
    'stats.event.shares': 'Shares',
    'stats.event.chats': 'Chats',
    'stats.event.likes': 'Likes',
    'stats.event.unlikes': 'Unlikes',
    'stats.event.comments': 'Comments',
    'dialog.loginRequired.title': 'Login Required',
    'dialog.loginRequired.message': 'You must sign in first to access this feature',
    'dialog.loginRequired.loginButton': 'Sign In',
    'dialog.loginRequired.cancelButton': 'Cancel',
    'dialog.emailVerify.title': 'Verify your email',
    'dialog.emailVerify.message': 'You must verify your email before posting or interacting with listings.',
    'dialog.emailVerify.verifyButton': 'Verify email',
    'dialog.emailVerify.cancelButton': 'Later',
    'filter.filterResults': 'Filter Results',
    'filter.filterDescription': 'City, Price, and Post Attributes',
    'filter.close': 'Close',
    'filter.reset': 'Reset',
    'filter.city': 'City',
    'filter.allCities': 'All Cities',
    'filter.priceRange': 'Price Range',
    'filter.from': 'From',
    'filter.to': 'To',
    'filter.postAttributes': 'Post Attributes',
    'filter.apply': 'Apply',
    'filter.noAttributesAvailable': 'No attributes available for this category.',
    'filter.selectField': 'Select',
    'filter.postImages': 'Post Images',
    'filter.allPosts': 'All Posts',
    'filter.withImages': 'Posts with images',
    'filter.withoutImages': 'Posts without images',
    'filter.sortBy': 'Sort by',
    'filter.sortNewest': 'Newest first',
    'filter.sortOldest': 'Oldest first',
    'filter.sortPriceLowToHigh': 'Price: low to high',
    'filter.sortPriceHighToLow': 'Price: high to low',
    'createPost.smartTitle': 'Create Your Smart Ad',
    'createPost.heroTitle': 'Start your smart ad',
    'createPost.heroSubtitle': "Write your idea—we'll turn it into a polished ad that attracts buyers.",
    'createPost.heroAddAd': 'Add ad',
    'createPost.heroPlaceholder': 'Write what you want to sell…',
    'createPost.heroTagTitle': 'Catchy title',
    'createPost.heroTagDesc': 'Strong description',
    'createPost.heroTagPrice': 'Fair price',
    'createPost.heroTagPhotos': 'Great photos',
    'createPost.launch': 'Launch Smart Ad',
    'createPost.placeholder': 'What are you selling today?',
    'createPost.chipDemand': '🔥 High Demand in Amman',
    'createPost.chipRoi': '📊 82% ROI Forecast',
    'createPost.chipTarget': '🎯 Target Age 25–34',
    'createPost.chipBudget': '💰 Suggested Budget: $45',
    'createPost.wizard.step1': 'Text',
    'createPost.wizard.step2': 'Photos',
    'createPost.wizard.step3': 'Section',
    'createPost.wizard.step4': 'Category',
    'createPost.wizard.step5': 'Details',
    'createPost.wizard.step6': 'Publish',
    'createPost.wizard.dynamicFields': 'Ad fields',
    'createPost.wizard.lead':
      'Start with a clear title, then add a short description buyers will understand at a glance.',
    'createPost.wizard.navPrev': 'Back',
    'createPost.wizard.navNext': 'Continue',
    'createPost.wizard.navSubmit': 'Publish ad',
    'createPost.wizard.navSubmitEdit': 'Save changes',
    'createPost.wizard.navSubmitting': 'Publishing…',
    'createPost.edit.reviewNoticeTitle': 'Before you save',
    'createPost.edit.reviewNoticeMessage':
      'Saving your changes will send this ad back for review. It won’t be visible to visitors until an admin approves it again.',
    'createPost.edit.confirmTitle': 'Send ad back for review?',
    'createPost.edit.confirmMessage':
      'Saving these changes will temporarily hide the ad from everyone until it is reviewed and approved again. Continue?',
    'createPost.edit.confirmContinue': 'Yes, save and submit for review',
    'createPost.edit.confirmCancel': 'Cancel',
    'createPost.photos.title': 'Ad photos',
    'createPost.photos.hint':
      'Add up to 5 clear photos (JPG, PNG, or WebP). Max 5 MB per file. Photos are sent when you publish or update the ad.',
    'createPost.photos.savedTitle': 'Saved on the server',
    'createPost.photos.savedHint': 'These are on your current ad. You can remove any before saving.',
    'createPost.photos.newTitle': 'New photos to upload',
    'createPost.photos.badgeSuffix': 'to upload',
    'createPost.photos.dropHint': 'Drop images here or use “Add photos”.',
    'createPost.photos.dropActive': 'Drop to add photos…',
    'createPost.photos.addSlot': 'Add photos',
    'createPost.photos.removeAria': 'Remove from list',
    'createPost.photos.deleteSaved': 'Remove from ad',
    'createPost.photos.deleting': 'Removing…',
    'createPost.photos.rules': 'JPG · PNG · WebP — up to 5 MB each — 5 photos max.',
    'createPost.photos.confirmDelete': 'Remove this photo from the ad?',
    'createPost.photos.deleteFailed': 'Could not delete the photo',
    'createPost.photos.errTooLarge': 'A file over 5 MB was skipped.',
    'createPost.photos.errBadType': 'Only JPG, PNG, or WebP are accepted.',
    'createPost.photos.errSlotsFull': 'Maximum reached (5 photos). Remove one to add more.',
    'createPost.photos.errSomeSkipped': 'Some files were not added because the limit was reached.',
    'createPost.success.celebrationTitle': '🎉 Published successfully!',
    'createPost.success.celebrationSubtitle': 'Your ad is live. Open it or find it in your ads list.',
    'createPost.success.pendingTitle': 'Your ad was submitted for review',
    'createPost.success.pendingSubtitle': 'It will appear publicly after admin approval. You can track it in your ads list.',
    'createPost.success.viewMyAds': 'My ads',
    'createPost.success.viewPost': 'View ad',
    'createPost.success.viewFeed': 'Go to my ads',
    'createPost.success.viewHomeFeed': 'Go to home feed',
    'createPost.success.close': 'Keep browsing',
    'createPost.success.updated': 'Ad updated successfully',
    'createPost.success.updatedPending':
      'Changes saved and the ad was sent back for review. It will appear after admin approval.',
    'createPost.rateLimit.title': 'Please wait before posting another ad',
    'createPost.rateLimit.checking': 'Checking if you can post…',
    'createPost.rateLimit.intervalHint': 'You can post one ad every {minutes} minutes.',
    'createPost.rateLimit.hourlyHint': 'You have posted {count} of {max} allowed ads in the last hour.',
    'createPost.rateLimit.countdownLabel': 'You can post in',
    'createPost.rateLimit.verificationHint': 'Verify your account to post without waiting limits.',
    'createPost.rateLimit.requestVerification': 'Request account verification',
    'createPost.rateLimit.requestVerificationSubmitting': 'Submitting request…',
    'createPost.rateLimit.requestVerificationPending': 'Your request is under review',
    'createPost.rateLimit.requestVerificationRetry': 'Request verification again',
    'createPost.rateLimit.requestVerificationFailed': 'Could not submit verification request',
    'auction.searchPlaceholder': 'Search for anything...',
    'auction.postAd': 'Post Ad',
    'auction.boost': 'Boost',
    'auction.chip.updates': 'Updates',
    'auction.chip.lives': 'Lives',
    'auction.chip.hotDeals': 'Hot Deals',
    'auction.chip.auctions': 'Auctions',
    'auction.tab.realEstate': 'Real Estate',
    'auction.tab.furniture': 'Furniture',
    'auction.tab.electronics': 'Electronics',
    'auction.tab.auctions': 'Auctions',
    'auction.trending.title': 'Trending Ads',
    'auction.trending.hint': 'Top picks today',
    'auction.trending.cars': 'Cars',
    'auction.trending.villa': 'Fitted Villa',
    'auction.trending.brand': 'Brands',
    'auction.trending.boost': 'Boost Ad',
    'auction.trending.metaNew': 'New • 03',
    'auction.trending.metaHot': 'Hot • 00',
    'auction.trending.metaNow': 'Now • 18',
    'auction.trending.metaPromo': 'Promo',
    'auction.live.title': 'Live Auctions',
    'auction.live.hint': 'Bid in real time',
    'auction.live.endsIn': 'Ends in',
    'auction.live.bids': 'bids',
    'auction.live.currentPrice': 'Current price',
    'auction.live.secure': 'Secure payments',
    'auction.live.bidNow': 'Bid Now',
    'auction.live.showcase': 'All Showcase',
    'auction.live.tires': 'Tires',
    'auction.live.shoes': 'Shoes',
    'auction.live.tools': 'DIY Tools',
    'auction.panel.title': 'Quick Panel',
    'auction.panel.hint': 'Create your ad in a few steps',
    'auction.panel.chooseCategory': 'Choose Category',
    'auction.panel.typeCategory': 'Type a category...',
    'auction.panel.go': 'Go',
    'auction.panel.uploadMedia': 'Upload Media',
    'auction.panel.dragDrop': 'Drag & drop or click to upload',
    'auction.panel.upload': 'Upload',
    'auction.step.start': 'Start',
    'auction.step.next': 'Next',
    'auction.step.done': 'Done',
    'auction.step1.title': 'Choose Category',
    'auction.step1.desc': 'Pick the right category for better reach',
    'auction.step2.title': 'Set Price & Location',
    'auction.step2.desc': 'Price range & your city',
    'auction.step3.title': 'Premium Subscription',
    'auction.step3.desc': 'Boost visibility and get more bids',
    'auction.step4.title': 'Publish Ad',
    'auction.step4.desc': 'Review and publish in seconds',
    'auction.publish': 'Publish Ad',
    'auctionPosts.brandGuide': 'BRAND STYLE GUIDE',
    'auctionPosts.heroTitle': 'ANANAS',
    'auctionPosts.heroSubtitle': 'Brand Style Guide',
    'auctionPosts.trendingTitle': 'Trending Ads',
    'auctionPosts.trending.pill': 'ANANAS',
    'auctionPosts.trending.badgeAd': 'Ad',
    'auctionPosts.trending.like': 'LIKE',
    'auctionPosts.trending.live': 'LIVE',
    'auctionPosts.trending.card2.line1': 'Rirkuit',
    'auctionPosts.trending.card2.line2': 'DNQic9 9od',
    'auctionPosts.trending.card3.line1': 'Dw9aor',
    'auctionPosts.trending.card3.line2': 'DNQN09 9od',
    'auctionPosts.livePackageTitle': 'Live Package',
    'auctionPosts.postAdTitle': 'Post Ad',
    'auctionPosts.postAdDesc': 'Fun but professional. Friendly mascots with a startup-tech vibe. Middle East friendly, unique, unicorn-ready.',
    'auctionPosts.tag.popular': 'Popular',
    'auctionPosts.tag.live': 'Live',
    'auctionPosts.tag.brand': 'Brand',
    'auctionPosts.cta.bid': 'Bid',
    'auctionPosts.cta.boostAd': 'Boost Ad',
    'auctionPosts.live.card1.title': 'Vies Title',
    'auctionPosts.live.card1.topTitle': 'Upload',
    'auctionPosts.live.card1.topSub': '5 rotate',
    'auctionPosts.live.card1.desc': 'Fast starter content',
    'auctionPosts.live.card2.title': 'Tiree Title',
    'auctionPosts.live.card2.topTitle': 'Boost Ad',
    'auctionPosts.live.card2.topSub': '33:00',
    'auctionPosts.live.card2.desc': 'Premium placement boost',
    'auctionPosts.live.card3.title': 'Live a Title',
    'auctionPosts.live.card3.desc': 'Real-time bidding feed',
    'auctionPosts.small.new': 'New',
    'auctionPosts.small.likes': 'Likes',
    'auctionPosts.small.boost': 'Boost Ad',
    'auctionPosts.small.view': 'View',
    'auctionPosts.small.recommended': 'Recommended',
    'auctionPosts.small.sponsored': 'Sponsored',
    'auctionPosts.small.live': 'Live',
    'auctionPosts.small.captions': 'Captions',
    'auctionPosts.live.pill.community': 'COMMUNITY',
    'auctionPosts.live.priceNote.bid': 'Money Bid',
    'auctionPosts.live.priceNote.shares': 'Mnow / Shs',
    'auctionPosts.live.unit.rma': 'rma',
    'auctionPosts.live.footerNote.a': '$40  $40',
    'auctionPosts.live.footerNote.b': '$40  $40',
    'auctionPosts.live.footerNote.c': '$40  $40',
    'auctionPosts.live.bio': 'Bio',
    'auctionPosts.live.col1.k': 'feictuh',
    'auctionPosts.live.col1.v': '$0.35',
    'auctionPosts.live.col2.k': 'rotordemse',
    'auctionPosts.live.col2.v': 'sflove',
    'notifications.title': 'Notifications',
    'notifications.subtitle': 'Everything that matters, in one place',
    'notifications.empty': 'No notifications yet',
    'notifications.emptyHint': 'We’ll let you know here when something new happens.',
    'notifications.viewAll': 'View all',
    'notifications.markAll': 'Mark all as read',
    'notifications.markAllShort': 'Mark all',
    'notifications.unreadOne': '1 unread notification',
    'notifications.unreadFew': 'unread notifications',
    'notifications.allCaughtUp': 'You’re all caught up',
    'notifications.loading': 'Loading…',
    'notifications.justNow': 'just now',
    'notifications.openBell': 'Open notifications',
    'notifications.closeBell': 'Close notifications',
    'notifications.newBadge': 'New',
    'realtime.newPost.title': 'New post just dropped',
    'realtime.newPost.subtitle': 'A new listing was just published on ANANAS',
    'realtime.newPost.viewNow': 'View post',
    'realtime.newPost.dismiss': 'Dismiss',
    'realtime.newPost.disable': 'Stop these alerts',
    'realtime.newPost.disabledHint': 'New-post alerts are off',
    'realtime.newPost.enable': 'Turn alerts back on',
    'realtime.newPost.justNow': 'just now',
    'realtime.newPost.byAuthor': 'by',
    'realtime.newPost.pushedBadge': 'NEW · LIVE',
    'realtime.newPost.justArrived': 'Just arrived',

    // Messaging
    'messaging.title': 'Messaging',
    'messaging.searchPlaceholder': 'Search conversations...',
    'messaging.empty': 'No conversations yet',
    'messaging.emptyHint': 'Start chatting with sellers from any post and your conversations will appear here.',
    'messaging.noConversations': 'No conversations match your search',
    'messaging.startConversation': 'Start a new conversation',
    'messaging.selectConversation': 'Select a conversation',
    'messaging.selectConversationHint': 'Pick a conversation from the list to view messages, or start a new one from any post.',
    'messaging.online': 'Online',
    'messaging.offline': 'Offline',
    'messaging.typing': 'typing...',
    'messaging.you': 'You',
    'messaging.justNow': 'Just now',
    'messaging.minutesAgo': '{n} min ago',
    'messaging.hoursAgo': '{n}h ago',
    'messaging.daysAgo': '{n}d ago',
    'messaging.yesterday': 'Yesterday',
    'messaging.today': 'Today',
    'messaging.composerPlaceholder': 'Write a message...',
    'messaging.send': 'Send',
    'messaging.attach': 'Attach',
    'messaging.emoji': 'Emoji',
    'messaging.composerDisabledClosed': 'This conversation is closed — sending is disabled.',
    'messaging.composerDisabledBlocked': 'You can no longer send messages in this conversation.',
    'messaging.viewPost': 'View post',
    'messaging.linkedPost': 'Linked post',
    'messaging.postId': 'Post #',
    'messaging.menu': 'Menu',
    'messaging.actions.markRead': 'Mark as read',
    'messaging.actions.viewProfile': 'View profile',
    'messaging.actions.viewPost': 'Open post',
    'messaging.actions.clear': 'Clear conversation',
    'messaging.actions.close': 'Close conversation',
    'messaging.actions.reopen': 'Reopen conversation',
    'messaging.actions.block': 'Block user',
    'messaging.actions.unblock': 'Unblock user',
    'messaging.actions.report': 'Report conversation',
    'messaging.actions.delete': 'Delete chat',
    'messaging.confirm.clearTitle': 'Clear this conversation?',
    'messaging.confirm.clearBody': 'All messages will be hidden from your view. The other side keeps their copy.',
    'messaging.confirm.closeTitle': 'Close this conversation?',
    'messaging.confirm.closeBody': 'Neither side will be able to send new messages once closed.',
    'messaging.confirm.blockTitle': 'Block this user?',
    'messaging.confirm.blockBody': 'They will no longer be able to message you in this conversation.',
    'messaging.confirm.deleteTitle': 'Delete chat?',
    'messaging.confirm.deleteBody': 'The chat will be hidden from your list. The other side still has access.',
    'messaging.confirm.confirm': 'Confirm',
    'messaging.confirm.cancel': 'Cancel',
    'messaging.report.title': 'Report this conversation',
    'messaging.report.subtitle': 'Our moderation team will review your report. Thanks for helping keep the community safe.',
    'messaging.report.categoryLabel': 'Report type',
    'messaging.report.category.spam': 'Spam',
    'messaging.report.category.harassment': 'Harassment',
    'messaging.report.category.scam': 'Scam',
    'messaging.report.category.inappropriate': 'Inappropriate content',
    'messaging.report.category.other': 'Other',
    'messaging.report.reasonLabel': 'Reason',
    'messaging.report.reasonPlaceholder': 'Briefly describe the issue...',
    'messaging.report.descriptionLabel': 'Additional details (optional)',
    'messaging.report.descriptionPlaceholder': 'Anything else that helps us understand the situation...',
    'messaging.report.submit': 'Submit report',
    'messaging.report.submitting': 'Submitting...',
    'messaging.report.success': 'Report received. The team will review it.',
    'messaging.report.error': 'Could not submit your report. Please try again.',
    'messaging.banner.closed': 'Conversation closed',
    'messaging.banner.blockedByYou': 'You blocked this user',
    'messaging.banner.blockedByOther': 'Messaging disabled in this conversation',
    'messaging.banner.cleared': 'Your view of this conversation was cleared',
    'messaging.banner.connecting': 'Connecting...',
    'messaging.banner.live': 'Live',
    'messaging.banner.polling': 'Sync mode',
    'messaging.errors.send': 'Failed to send message',
    'messaging.errors.load': 'Failed to load conversations',
    'messaging.unread': 'New',
    'messaging.delivered': 'Delivered',
    'messaging.seen': 'Seen',
    'messaging.sent': 'Sent',
    'messaging.sending': 'Sending...',
    'messaging.failed': 'Failed',
    'messaging.retry': 'Retry',
    'notFound.badge': 'Alert: page not found',
    'notFound.title': 'This page does not exist',
    'notFound.lead':
      'The link may be broken or the page was removed. We can take you back to the home page.',
    'notFound.backHome': 'Back to home',
    'notFound.siteName': 'Ananas',
    'selectCountry.metaTitle': 'Choose your country | ANANAS — classifieds & digital marketplace',
    'selectCountry.metaDescription':
      'Pick your country to open the right ANANAS experience: local listings, posts, and messaging in your market and language. Available for Jordan, Egypt, Saudi Arabia, UAE, and more.',
    'selectCountry.h1': 'Choose your country to continue on ANANAS',
    'selectCountry.lead':
      'Each country has its own subdomain with local content, cities, and relevance. Select yours below to go to the correct regional site.',
    'selectCountry.intro':
      'ANANAS is a regional classifieds and digital commerce platform. Choosing a country helps show nearby results and the right local experience.',
    'selectCountry.listTitle': 'Available countries',
    'selectCountry.cardCta': 'Open country site',
    'selectCountry.cardHint': 'Opens this country’s subdomain in the same browser tab.',
    'selectCountry.isoLabel': 'Country code',
    'selectCountry.empty': 'No countries are available right now. Please try again later.',
    'selectCountry.switchToEn': 'English',
    'selectCountry.switchToAr': 'العربية',
    'selectCountry.langSwitchAria': 'Switch page language',
    'selectCountry.skipToList': 'Skip to country list',
    'selectCountry.breadcrumbHome': 'Home',
    'selectCountry.breadcrumbCurrent': 'Choose country',
  },
}

export type ContactPageCopy = {
  title: string
  subtitle: string
  name: string
  email: string
  subject: string
  message: string
  submit: string
  submitting: string
  success: string
  error: string
  rateLimited: string
  nameRequired: string
  emailRequired: string
  emailInvalid: string
  subjectRequired: string
  messageRequired: string
}

function normalizeLocale(locale: SupportedLocale | string | null | undefined): SupportedLocale {
  if (locale === 'en' || locale === 'ar') {
    return locale
  }
  if (typeof locale === 'string') {
    const base = locale.toLowerCase().split('-')[0]
    if (base === 'en') return 'en'
    if (base === 'ar') return 'ar'
  }
  return 'ar'
}

export type EmailVerifyPageCopy = {
  title: string
  subtitle: string
  sentTo: string
  codeLabel: string
  codePlaceholder: string
  verify: string
  verifying: string
  resend: string
  resending: string
  changeEmail: string
  newEmail: string
  updateEmail: string
  success: string
  error: string
  codeRequired: string
  emailRequired: string
  emailInvalid: string
  signOut: string
  hint: string
}

export function getEmailVerifyPageCopy(locale: SupportedLocale | string): EmailVerifyPageCopy {
  const loc = normalizeLocale(locale)

  return {
    title: t('emailVerify.title', loc),
    subtitle: t('emailVerify.subtitle', loc),
    sentTo: t('emailVerify.sentTo', loc),
    codeLabel: t('emailVerify.codeLabel', loc),
    codePlaceholder: t('emailVerify.codePlaceholder', loc),
    verify: t('emailVerify.verify', loc),
    verifying: t('emailVerify.verifying', loc),
    resend: t('emailVerify.resend', loc),
    resending: t('emailVerify.resending', loc),
    changeEmail: t('emailVerify.changeEmail', loc),
    newEmail: t('emailVerify.newEmail', loc),
    updateEmail: t('emailVerify.updateEmail', loc),
    success: t('emailVerify.success', loc),
    error: t('emailVerify.error', loc),
    codeRequired: t('emailVerify.codeRequired', loc),
    emailRequired: t('emailVerify.emailRequired', loc),
    emailInvalid: t('emailVerify.emailInvalid', loc),
    signOut: t('emailVerify.signOut', loc),
    hint: t('emailVerify.hint', loc),
  }
}

export function getContactPageCopy(locale: SupportedLocale | string): ContactPageCopy {
  const loc = normalizeLocale(locale)

  return {
    title: t('contact.title', loc),
    subtitle: t('contact.subtitle', loc),
    name: t('contact.name', loc),
    email: t('contact.email', loc),
    subject: t('contact.subject', loc),
    message: t('contact.message', loc),
    submit: t('contact.submit', loc),
    submitting: t('contact.submitting', loc),
    success: t('contact.success', loc),
    error: t('contact.error', loc),
    rateLimited: t('contact.rateLimited', loc),
    nameRequired: t('contact.nameRequired', loc),
    emailRequired: t('contact.emailRequired', loc),
    emailInvalid: t('contact.emailInvalid', loc),
    subjectRequired: t('contact.subjectRequired', loc),
    messageRequired: t('contact.messageRequired', loc),
  }
}

export function t(
  key: TranslationKey,
  locale: SupportedLocale | string = 'ar',
  params?: Record<string, string | number>,
): string {
  const loc = normalizeLocale(locale)
  let text = translations[loc][key] ?? translations.ar[key] ?? key
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue))
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
    }
  }
  return text
}
