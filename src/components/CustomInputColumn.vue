<template>
  <el-dialog
    v-if="dialogVisible"
    v-model="dialogVisible"
    title="根据文档输入字段生成"
    width="800px"
    :before-close="handleClose"
  >
    <div class="h-700px">
      <!--  请求json生成   -->
      <div class="mb-20px">
        <el-form-item label="填写json生成" prop="isAdd" label-position="left">
          <el-switch
            v-model="showJson"
            inline-prompt
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
        <div v-if="showJson" class="rowSE">
          <el-input v-model.trim="textareaValue" class="w-400px" type="textarea" rows="10" />
          <el-button type="primary" class="ml-20px" @click="genJsonToTable">生成</el-button>
        </div>
      </div>
      <el-table class="column-table" row-key="uuid" :data="tableData" stripe style="width: 100%" height="400px" border>
        <el-table-column prop="columnName" label="字段" width="200">
          <template #default="{ row }">
            <el-input v-model="row.columnName" placeholder="请输入字段名称" />
          </template>
        </el-table-column>
        <el-table-column prop="columnComment" label="字段描述" min-width="300">
          <template #default="{ row }">
            <el-input v-model="row.columnComment" placeholder="请输入字段描述 " />
          </template>
        </el-table-column>

        <el-table-column prop="columnComment" label="删除" width="90">
          <template #default="{ $index }">
            <el-button text type="danger" @click="deleteItem($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-15px">
        <el-button type="primary" @click="addTableColumn">新增</el-button>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirmBtnClick">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'

const showJson = $ref(true)
let textareaValue = $ref('{"name":"名字","age":"年龄"}')

let tableData = $ref([])

let dialogVisible = $ref(false)

const handleClose = () => {
  ElMessageBox.confirm('退出将清空您配置的数据').then(() => {
    dialogVisible = false
  })
}

const showModal = (tableArr) => {
  if (tableArr?.length) {
    const objValue = {}
    tableArr.forEach((fItem) => {
      objValue[fItem.columnName] = fItem.columnComment
    })
    textareaValue = JSON.stringify(objValue)
  }

  dialogVisible = true
  nextTick(() => {
    //排序
    rowDrop(tableData, 'column-table')
  })
}
const addTableColumn = () => {
  tableData.push({
    columnName: '',
    columnComment: '',
    uuid: getGuid()
  })
}
const deleteItem = (index) => {
  tableData.splice(index, 1)
}
const emits = defineEmits(['emitCICConfirm'])

const confirmBtnClick = () => {
  emits(
    'emitCICConfirm',
    tableData.filter((fItem) => fItem.columnName)
  )
  dialogVisible = false
  tableData = []
}

//json生成table
const genJsonToTable = () => {
  if (textareaValue && typeof textareaValue === 'string') {
    const ToJson = dillScssExportToJson(textareaValue)
    //设置到table
    Object.entries(JSON.parse(ToJson)).forEach(([key, value]) => {
      tableData.push({
        columnName: key,
        columnComment: value,
        uuid: getGuid()
      })
    })
  }
}
//dill string to Json
const dillScssExportToJson = (scssExportJson) => {
  return scssExportJson.replace(/:export\s*/, '').replace(/[\s+\r\n]/g, '')
}
defineExpose({ showModal })
</script>

<style lang="scss" scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}

.modal-style {
  width: 1000px !important;
  min-height: 500px;
}
</style>
