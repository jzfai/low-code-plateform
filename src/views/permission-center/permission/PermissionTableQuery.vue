<template>
  <div class="mt-10px query-page-style">
    <!--条件搜索-->
    <el-form ref="refSearchForm" :inline="true" :model="searchForm">
      <el-form-item prop="name">
        <el-input v-model="searchForm.name" class="w-150px" placeholder="权限名称" />
      </el-form-item>
      <el-form-item prop="plateFormId">
        <el-select v-model="searchForm.plateFormId" filterable placeholder="平台名称" class="w-150px">
          <el-option
            v-for="item in plateFormIdData"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            @click="setPlateForm(item)"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="category">
        <el-select v-model="searchForm.category" clearable class="w-150px" placeholder="权限类别">
          <el-option label="路由" value="1" />
          <el-option label="内页" value="2" />
          <el-option label="按钮" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <!--查询按钮-->
        <el-button type="primary" @click="resetPageReq">查询</el-button>
        <el-button type="primary" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="rowES mb-10px">
      <el-button type="primary" @click="addBtnClick">
        <el-icon style="vertical-align: middle">
          <FolderAdd />
        </el-icon>
        <span style="vertical-align: middle">增加</span>
      </el-button>
      <el-button type="primary" @click="multiDelBtnClick">
        <el-icon style="vertical-align: middle">
          <Delete />
        </el-icon>
        <span style="vertical-align: middle">删除</span>
      </el-button>
    </div>
    <!--表格和分页-->
    <el-table
      id="resetElementDialog"
      ref="refuserTable"
      row-key="id"
      :height="`calc(100vh - ${settings.delWindowHeight})`"
      border
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :data="tableListData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column show-overflow-tooltip align="left" prop="name" label="权限名称" min-width="250" />
      <el-table-column show-overflow-tooltip align="center" prop="title" label="页面标题" min-width="150" />
      <el-table-column show-overflow-tooltip align="center" prop="code" label="CODE代码" min-width="200" />
      <el-table-column show-overflow-tooltip align="center" prop="plateFormId" label="平台名称" min-width="150">
        <template #default="{ row }">
          <span v-if="row.plateFormId == 1">前端后端低代码平台</span>
          <span v-if="row.plateFormId == 2">vue3-admin-plus</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip align="center" prop="category" label="权限类别" min-width="80">
        <template #default="{ row }">
          <span v-if="row.category == 1">路由</span>
          <span v-if="row.category == 2">内页</span>
          <span v-if="row.category == 3">按钮</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip align="center" prop="path" label="路由路径" min-width="100" />
      <el-table-column show-overflow-tooltip align="center" prop="sort" label="排序" min-width="80" />
      <el-table-column show-overflow-tooltip align="center" prop="redirect" label="重定向路径" min-width="100" />
      <el-table-column show-overflow-tooltip align="center" prop="component" label="组件" min-width="100" />
      <el-table-column show-overflow-tooltip align="center" prop="elSvgIcon" label="element的icon" min-width="120" />
      <el-table-column show-overflow-tooltip align="center" prop="icon" label="svg图标" min-width="100" />
      <!--点击操作-->
      <el-table-column fixed="right" align="center" label="操作" width="170">
        <template #default="{ row }">
          <div class="table-operation-btn">
            <span @click="judgePage('PermissionAddEdit', { isAddChildren: true, row })">添加子菜单</span>
            <span @click="judgePage('PermissionAddEdit', { isEdit: true, row })">编辑</span>
            <span @click="tableDelClick(row)">删除</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <div v-if="totalPage >= 10" class="rowCC mt-20px">
      <el-pagination
        :current-page="pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { Delete, FolderAdd } from '@element-plus/icons-vue'
import settings from '@/settings'

const judgePage = (name, params) => {
  routerPush(name, params)
}
const searchForm = reactive({
  name: '',
  plateFormId: 0,
  parentId: '0',
  category: ''
})
searchForm.plateFormId = Number.parseFloat(localStorage.getItem('plateFormId') as string) || settings.plateFormId

const setPlateForm = ({ id }) => {
  localStorage.setItem('plateFormId', id)
  selectPageReq()
}

const selectPageReq = () => {
  const reqConfig = {
    url: '/basis-func/permission/selectPage',
    method: 'get'
  }
  pageSize.value = 100
  tableListReq(reqConfig).then(({ data }) => {
    tableListData.value = data.records
  })
}
//重置
const refSearchForm = $ref(null)
const resetForm = () => {
  refSearchForm.resetFields()
  dateRangePacking(['', ''])
  resetPageReq()
}

//批量删除
const multiDelBtnClick = () => {
  const reqConfig = {
    url: '/basis-func/permission/deleteBatchIds',
    method: 'delete',
    bfLoading: true
  }
  multiDelBtnDill(reqConfig)
}

//单个删除
const tableDelClick = (row) => {
  const reqConfig = {
    url: '/basis-func/permission/deleteById',
    data: { id: row.id },
    isParams: true,
    method: 'delete',
    bfLoading: true
  }
  tableDelDill(row, reqConfig)
}

//添加和修改详情
const addBtnClick = () => {
  routerPush('PermissionAddEdit')
}
const tableDetailClick = (row) => {
  routerPush('PermissionDetail', { isDetail: true, row })
}
onMounted(() => {
  selectPageReq()
  plateFormIdReq()
})
let plateFormIdData = $ref([])
const plateFormIdReq = () => {
  const reqConfig = {
    url: '/basis-func/plateForm/selectPage',
    method: 'get'
  }
  axiosReq(reqConfig).then(({ data }) => {
    plateFormIdData = data.records
  })
}

//引入table-query相关的hooks 方法
let {
  pageNum,
  pageSize,
  totalPage,
  tableListData,
  tableListReq,
  dateRangePacking,
  handleSelectionChange,
  handleCurrentChange,
  handleSizeChange,
  resetPageReq,
  multiDelBtnDill,
  tableDelDill
} = useTable(searchForm, selectPageReq)
</script>

<style scoped lang="scss"></style>
