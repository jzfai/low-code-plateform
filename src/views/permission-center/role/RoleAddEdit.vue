<template>
  <div class="project-page-style">
    <FoldingCard :title="isEdit ? '编辑' : '新增'">
      <el-form ref="refForm" label-width="150px" :inline="false" :model="subForm">
        <el-form-item label="配置名字" prop="name" :rules="formRules.isNotNull('配置名字不能为空')">
          <el-input v-model="subForm.name" class="wi-300px" placeholder="配置名字" />
        </el-form-item>
        <el-form-item label="CODE代码" prop="code" :rules="formRules.isNotNull('角色唯一CODE代码不能为空')">
          <el-input v-model="subForm.code" class="wi-300px" placeholder="角色唯一CODE代码" />
        </el-form-item>
        <el-form-item label="角色介绍" prop="intro" :rules="formRules.isNotNull('角色介绍不能为空')">
          <el-input
            v-model="subForm.intro"
            type="textarea"
            maxlength="100"
            show-word-limit="show-word-limit"
            autosize="autosize"
            resize="none"
            clearable="clearable"
            class="wi-300px"
            placeholder="请输入角色介绍"
          />
        </el-form-item>
        <!--        <el-form-item label="权限Id" prop="permissionId" :rules="formRules.isNotNull('权限Id不能为空')">-->
        <!--          <el-input v-model="subForm.permissionId" class="wi-300px" placeholder="权限Id" />-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="是否激活" prop="deleted" :rules="formRules.isNotNull('请选择是否激活')">-->
        <!--          <el-radio-group v-model="subForm.deleted">-->
        <!--            <el-radio :label="1">未激活</el-radio>-->
        <!--            <el-radio :label="0">已激活</el-radio>-->
        <!--          </el-radio-group>-->
        <!--        </el-form-item>-->
      </el-form>
      <div class="footer-btn columnCC">
        <div class="rowSS">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="confirmBtnClick">确定</el-button>
        </div>
      </div>
    </FoldingCard>

    <FoldingCard title="菜单权限配置">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane v-for="(item, index) in plateFormList" :key="index" :label="item.name" :name="item.id">
          <el-tree
            ref="treeRef"
            node-key="id"
            default-expand-all
            show-checkbox
            :data="item.permissionList"
            :props="{ children: 'children', label: 'name' }"
            @node-click="handleNodeClick"
          />
        </el-tab-pane>
      </el-tabs>
      <!--      <el-button @click="testTree">testTree</el-button>-->
      <!--      <el-button @click="setTree">setTree</el-button>-->
    </FoldingCard>
  </div>
</template>

<script setup lang="ts">
/*回显数据*/
import type { TabsPaneContext } from 'element-plus'
const { isEdit, row } = getQueryParam()
let detailData = $ref({})
if (isEdit) {
  onBeforeMount(async () => {
    const { data } = await getDetailByIdReq(row.id)
    detailData = data

    reshowData(data, subForm)
  })
}
//获取详情数据
const getDetailByIdReq = (id) => {
  return axiosReq({
    url: '/basis-func/role/selectById',
    data: { id },
    method: 'get'
  })
}
onMounted(() => {})
/*新增和更新*/
let subForm = reactive({ id: '', name: '', code: '', intro: '', parentId: '', permissionId: '', deleted: '' })
const refForm = $ref(null)
const confirmBtnClick = () => {
  refForm.validate((valid) => {
    if (valid) {
      //设置权限id列表
      subForm.permissionId = JSON.stringify(getTreeItemsAndPlateFormId())
      if (subForm.id) {
        updateReq()
      } else {
        insertReq()
      }
    } else {
      return false
    }
  })
}
const insertReq = () => {
  const data = JSON.parse(JSON.stringify(subForm))
  delete data.id
  axiosReq({
    url: '/basis-func/role/insert',
    data,
    method: 'post',
    bfLoading: true
  }).then(() => {
    elMessage('保存成功')
    routerBack()
  })
}
//更新
let updateReq = () => {
  return axiosReq({
    url: '/basis-func/role/updateById',
    data: subForm,
    method: 'put',
    bfLoading: true
  }).then(() => {
    elMessage('更新成功')
    routerBack()
  })
}
/*4.上传文件*/
//获取 plateFormId
let plateFormList = $ref([])
const plateFormListReq = () => {
  return axiosReq({
    url: '/basis-func/plateForm/selectPage',
    data: { pageNum: 1, pageSize: 200 },
    method: 'get',
    bfLoading: true
  }).then(({ data }) => {
    plateFormList = data.records?.map((mItem) => {
      permissionListReq(mItem.id).then(({ data }) => {
        mItem.permissionList = data.records
      })
      return mItem
    })

    sleepTimeout(100).then(() => {
      reshowTree()
      //取第一个
      const firstItem = plateFormList[0]
      activeName = firstItem.id

      console.log('plateFormList', plateFormList)
    })
  })
}
const dillData = async () => {}
//回显tree权限
let reshowTree = () => {
  if (detailData.permissionId) {
    const ObjItem: any = JSON.parse(detailData.permissionId)
    plateFormList.forEach((fItem, index) => {
      if (ObjItem[fItem.id]) {
        sleepTimeout(100).then(() => {
          ObjItem[fItem.id].forEach((eItem) => {
            treeRef.value[index]!.setChecked(eItem, true, false)
          })
        })
      }
    })
  }
}
plateFormListReq()
let permissionListReq = (plateFormId) => {
  return axiosReq({
    url: '/basis-func/permission/selectPage',
    data: { pageNum: 1, pageSize: 200, plateFormId, parentId: 0 },
    method: 'get',
    bfLoading: true
  })
}
//tabs
let activeName = $ref('')
const handleClick = (tab: TabsPaneContext) => {
  // permissionListReq(tab.props.name)
}
//getData
const getTreeItemsAndPlateFormId = () => {
  const Obj = {}
  plateFormList.forEach((fItem, index) => {
    Obj[fItem.id] = treeRef.value[index]?.getCheckedNodes(false, true).map((mItem) => mItem.id)
  })
  console.log('Obj', Obj)
  return Obj
}

//tree
const treeRef: any = ref()
const handleNodeClick = (data) => {
  console.log(data)
}
const testTree = () => {
  console.log(treeRef.value[0]!.getCheckedNodes(false, true))
}
const setTree = () => {
  // treeRef.value[0]!.setCheckedKeys([2, 3, 5, 4], false)
  treeRef.value[0]!.setChecked(2, true, false)
}
const { reshowData, chooseFileName, handleCancel, formRules } = useForm(subForm)
</script>

<style scoped lang="scss"></style>
