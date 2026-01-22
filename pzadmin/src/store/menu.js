
const localData = localStorage.getItem('pz_v3pz')
const state = localData ? localData.menu : {
  isCollapse: false, // 菜单折叠状态
  selectMenu:[],
  routerList:[],
  menuActive: '1-1'
}

const mutations = {
  collapseMenu(state) {
     state.isCollapse = !state.isCollapse;
  },
  addMenu(state,payload){
    //对数据进行去重
    if(state.selectMenu.findIndex(item=>item.path===payload.path)===-1) {
      state.selectMenu.push(payload)
    }
  },
  closeMenu(state,payload){
    //找到点击数据的索引
    const index = state.selectMenu.findIndex(val => val.name === payload.name);
    //根据索引删除数据
    state.selectMenu.splice(index,1);
  },
  dynamicMenu(state, payload){
     // 递归设置真实路由组件
const modules = import.meta.glob('../views/**/**/*.vue')
console.log('所有可用组件路径:', Object.keys(modules))

function setRouteComponent(route) {
  if (route.children && route.children.length) {
    route.children.forEach(child => setRouteComponent(child))
  } else {
    // 注意！meta.path 一定要和实际 views 目录一致（如 /dashboard、/auth/admin 这种）
    const url = `../views${route.meta.path}/index.vue`
    if (modules[url]) {
      route.component = modules[url]
      console.log('[动态注册成功]', url)
    } else {
      route.component = null // 这里必须有，防止报错
      console.error('[路径找不到组件]', url)
    }
  }
}

function routerSet(routes) {
  routes.forEach(route => setRouteComponent(route))
}
    routerSet(payload)
    //拿到完整的路由数据
    state.routerList = payload
  },
  updateMenuActive(state, payload){
    state.menuActive = payload
  }
}

export default {
  state,
  mutations,
};