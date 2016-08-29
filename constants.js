altriaMap.constant('TIME_PERIOD_OPTIONS', [
  {
    label: 'All',
    value: 'all'
  },
  {
    label: 'Year To Date',
    value: 'ytd'
  },
  {
    label: 'Last 12 Months',
    value: 'now-12M,now'
  },
  {
    label: 'Last 6 Months',
    value: 'now-6M,now'
  },
  {
    label: 'Last Month',
    value: 'now-1M,now'
  },
  {
    label: 'Last 2 Weeks',
    value: 'now-2w,now'
  },
  {
    label: 'Last Week',
    value: 'now-7d,now'
  }
]);

altriaMap.constant('TIME_PERIODS', {
    'All': 'all',
    'Year To Date': 'ytd',
    'Last 12 Months': 'now-12m,now',
    'Last 6 Months': 'now-6m,now',
    'Last Month': 'now-1m,now',
    'Last 2 Weeks': 'now-2w,now',
    'Last Week': 'now-7d,now'
});

altriaMap.constant('AUTH_EVENTS', {
  loginSuccess: 'login-success',
  loginFailed: 'login-failed',
  logoutSuccess: 'logout-success',
  sessionTimeout: 'session-timeout',
  notAuthenticated: 'not-authenticated',
  notAuthorized: 'not-authorized',
  updatePasswordSuccess: 'update-password-success',
  updatePasswordFailed: 'update-password-failed'
});

altriaMap.constant('BRANDS', [
  {
    className: 'marlboro',
    displayName: 'Marlboro',
    available: true,
    lineColor: '#ed1c23',
    pieColors: ['#ed1c24', '#000000', '#f2c601', '#02b06f', '#0269ce'],
    reports: {
      reporting : false,
      promotions: true,
      platforms : false,
      ugc: true,
      email: true
    }
  },
  {
    className: 'skoal',
    displayName: 'Skoal',
    available: true,
    lineColor: '#fab61f',
    pieColors: ['#01609c', '#0f7e2f', '#fab61f', '#000000', '#53bcfe'],
    reports: {
      reporting : false,
      promotions: true,
      platforms : false,
      ugc: true,
      email: true
    }
  },
  {
    className: 'l-m',
    displayName: 'L & M',
    available: true,
    lineColor: '#014dab',
    pieColors: ['#014dab', '#000000', '#c6040b', '#15994a', '#f2c325'],
    reports: {
      reporting : false,
      promotions: true,
      platforms : false,
      ugc: true,
      email: true
    }
  },
  {
    className: 'copenhagen',
    displayName: 'Copenhagen',
    available: true,
    lineColor: '#b80412',
    pieColors: ['#b80412', '#000000', '#999999', '#0f7e2f', '#a7774c'],
    reports: {
      reporting : false,
      promotions: true,
      platforms : false,
      ugc: true,
      email: true
    }
  },
  {
    className: 'virginia-slims',
    displayName: 'Virginia Slims',
    available: true,
    lineColor: '#a53570',
    pieColors: ['#c1f2ff', '#549ec9', '#cccccc', '#eeefe9', '#a53570'],
    reports: {
      reporting : false,
      promotions: true,
      platforms : false,
      ugc: true,
      email: true
    }
  },
  {
    className: 'red-seal',
    displayName: 'RedSeal',
    available: true,
    lineColor: '#c9181e',
    pieColors: ['#c9181e', '#000000', '#999999', '#a7774c', '#d9aa71'],
    reports: {
      reporting : false,
      promotions: true,
      platforms : false,
      ugc: true,
      email: true
    }
  },
  {
    className: 'parliament',
    displayName: 'Parliament',
    available: true,
    lineColor: '#ec2c4b',
    pieColors: ['#ed1c24', '#000000', '#f2c601', '#02b06f', '#0269ce'],
    reports: {
      reporting : false,
      promotions: true,
      platforms : false,
      ugc: true,
      email: true
    }
  },
  {
    className: 'markten',
    displayName: 'MarkTen',
    available: false,
    lineColor: '#ccffff',
    pieColors: ['#ed1c24', '#000000', '#f2c601', '#02b06f', '#0269ce'],
    reports: {
      reporting : false,
      promotions: false,
      platforms : false,
      ugc: false,
      email: true
    }
  },
  {
    className: 'black-mild',
    displayName: 'Black & Mild',
    available: true,
    lineColor: '#a10700',
    pieColors: ['#a10700', '#3a2312', '#e9c888', '#21a3af', '#f6be00'],
    reports: {
      reporting : false,
      promotions: true,
      platforms : false,
      ugc: true,
      email: true
    }
  },
  {
    className: 'verve',
    displayName: 'Verve',
    available: false,
    lineColor: '#cccc99',
    pieColors: ['#ed1c24', '#000000', '#f2c601', '#02b06f', '#0269ce'],
    reports: {
      reporting : false,
      promotions: false,
      platforms : false,
      ugc: false,
      email: true
    }
  }
]);

altriaMap.constant('FORMATS',{
	DATE : 'date'
,	PERCENT : '%'
,	NUMBER : '#'
,	TEXT : 'txt'
,   HTML : 'html'
,	NA : 'n/a'
});

altriaMap.constant('REPORT_SUITE',{
	REPORTING : 'reporting'
,	PROMOTIONS : 'promotions'
,	PLATFORMS : 'platforms'
,	UGC : 'ugc'
, EMAIL : 'email'
});

var mock = false;
