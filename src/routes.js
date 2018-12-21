import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import monitoring from './views/nav1/monitoring.vue'
import monitorHis from './views/nav1/monitorHis.vue'
import ActException from './views/nav2/ActException.vue'
import ExceptionHis from './views/nav2/ExceptionHis.vue'
import CarTotal from './views/nav3/CarTotal.vue'
import ActVisibility from './views/nav4/ActVisibility.vue'
import VisibilityHistory from './views/nav4/VisibilityHistory.vue'

let routes = [
  {
    path: '/404',
    component: NotFound,
    name: '',
    hidden: true
  },
  {
    path: '/',
    component: Home,
    name: '实时监控',
    iconCls: 'el-icon-view', // 图标样式class
    children: [
      { path: '/monitoring', component: monitoring, name: '实时视频' },
      { path: '/monitorHis', component: monitorHis, name: '监控历史' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '异常事件',
    iconCls: 'el-icon-warning',
    children: [
      { path: '/ActException', component: ActException, name: '实时异常' },
      { path: '/ExceptionHis', component: ExceptionHis, name: '异常历史' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '车辆追踪',
    iconCls: 'fa fa-car',
    leaf: true, // 只有一个节点
    children: [{ path: '/CarTotal', component: CarTotal, name: '实时追踪' }]
  },
  {
    path: '/',
    component: Home,
    name: '能见度检测',
    iconCls: 'fa fa-cloud',
    // leaf: true,// 只有一个节点
    children: [
      { path: '/ActVisibility', component: ActVisibility, name: '实时能见度' },
      {
        path: '/VisibilityHistory',
        component: VisibilityHistory,
        name: '能见度历史'
      }
    ]
  },
  {
    path: '*',
    hidden: true,
    redirect: { path: '/404' }
  }
]

export default routes
