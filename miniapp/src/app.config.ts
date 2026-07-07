export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/drinks/index',
    'pages/inventory/index',
    'pages/favorites/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0a0a0a',
    navigationBarTitleText: '今晚喝什么',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0a0a0a',
  },
  tabBar: {
    color: '#666666',
    selectedColor: '#d4a843',
    backgroundColor: '#111111',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab-home.png',
        selectedIconPath: 'assets/tab-home-active.png',
      },
      {
        pagePath: 'pages/drinks/index',
        text: '酒单',
        iconPath: 'assets/tab-drinks.png',
        selectedIconPath: 'assets/tab-drinks-active.png',
      },
      {
        pagePath: 'pages/inventory/index',
        text: '库存',
        iconPath: 'assets/tab-inventory.png',
        selectedIconPath: 'assets/tab-inventory-active.png',
      },
      {
        pagePath: 'pages/favorites/index',
        text: '收藏',
        iconPath: 'assets/tab-favorites.png',
        selectedIconPath: 'assets/tab-favorites-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-profile.png',
        selectedIconPath: 'assets/tab-profile-active.png',
      },
    ],
  },
});
