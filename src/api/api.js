import axios from 'axios'
import Qs from 'qs'

let base = '/api'

export const requestLogin = params => {
  return axios.post(`${base}/login`, params).then(res => res.data)
}

export const getUserList = params => {
  return axios.get(`${base}/user/list`, { params: params })
}

export const getUserListPage = params => {
  return axios.get(`${base}/user/listpage`, { params: params })
}

export const removeUser = params => {
  return axios.get(`${base}/user/remove`, { params: params })
}

export const batchRemoveUser = params => {
  return axios.get(`${base}/user/batchremove`, { params: params })
}

export const editUser = params => {
  return axios.get(`${base}/user/edit`, { params: params })
}

export const addUser = params => {
  return axios.get(`${base}/user/add`, { params: params })
}

// 获取异常信息
export const getExceptions = params => {
  return axios.get(`${base}/object`, { params: params })
}

// 更新异常信息
export const updateException = params => {
  return axios.get(`${base}/update_objstatus`, { params: params })
}

// 获取车辆信息
export const getCars = params => {
  return axios.get(`${base}/getcars`, { params: params })
}

// 提交车辆，返回相关车辆记录
export const matchCar = params => {
  return axios({
    url: `${base}/matchcar`,
    method: 'post',
    data: Qs.stringify(params),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

// 获取能见度
export const getVisibility = params => {
  return axios.get(`${base}/visibility`, { params: params })
}

// 实时追踪摄像头
export const getCarCameras = params => {
  return axios.get(`${base}/carmatchcameras`, { params: params })
}

// 能见度摄像头
export const getViscameras = params => {
  return axios.get(`${base}/viscameras`, { params: params })
}

// 实时监控摄像头
export const getMonCameras = params => {
  return axios.get(`${base}/cameras`, { params: params })
}

// 历史监控
export const getHistoryimage = params => {
  return axios.get(`${base}/historyimage`, { params: params })
}
