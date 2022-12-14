import { ref } from 'vue';
import momentMini from 'moment-mini';
import { elConfirm, elMessage } from './use-element';
export const useTable = (searchForm, selectPageReq) => {
    const tableListData = ref([]);
    const totalPage = ref(0);
    const pageNum = ref(1);
    const pageSize = ref(20);
    const tableListReq = (config) => {
        const data = Object.assign({
            pageNum: pageNum.value,
            pageSize: pageSize.value
        }, JSON.parse(JSON.stringify(searchForm)));
        Object.keys(data).forEach((fItem) => {
            if (['', null, undefined, Number.NaN].includes(data[fItem]))
                delete data[fItem];
            if (config.method === 'get') {
                if (Array.isArray(data[fItem]))
                    delete data[fItem];
                if (data[fItem] instanceof Object)
                    delete data[fItem];
            }
        });
        const reqConfig = {
            data,
            ...config
        };
        return axiosReq(reqConfig);
    };
    const dateRangePacking = (timeArr) => {
        if (timeArr && timeArr.length === 2) {
            searchForm.startTime = timeArr[0];
            if (searchForm.endTime) {
                searchForm.endTime = momentMini(timeArr[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            }
        }
        else {
            searchForm.startTime = '';
            searchForm.endTime = '';
        }
    };
    const handleCurrentChange = (val) => {
        pageNum.value = val;
        selectPageReq();
    };
    const handleSizeChange = (val) => {
        pageSize.value = val;
        selectPageReq();
    };
    const resetPageReq = () => {
        pageNum.value = 1;
        selectPageReq();
    };
    const multipleSelection = ref([]);
    const handleSelectionChange = (val) => {
        multipleSelection.value = val;
    };
    const multiDelBtnDill = (reqConfig) => {
        let rowDeleteIdArr = [];
        let deleteNameTitle = '';
        rowDeleteIdArr = multipleSelection.value.map((mItem) => {
            deleteNameTitle = `${deleteNameTitle + mItem.id},`;
            return mItem.id;
        });
        if (rowDeleteIdArr.length === 0) {
            elMessage('????????????????????????', 'warning');
            return;
        }
        const stringLength = deleteNameTitle.length - 1;
        elConfirm('??????', `?????????????????????${deleteNameTitle.slice(0, stringLength)}??????`).then(() => {
            const data = rowDeleteIdArr;
            axiosReq({
                data,
                method: 'DELETE',
                bfLoading: true,
                ...reqConfig
            }).then(() => {
                elMessage('????????????');
                resetPageReq();
            });
        });
    };
    const tableDelDill = (row, reqConfig) => {
        elConfirm('??????', `?????????????????????${row.id}?????????`).then(() => {
            axiosReq(reqConfig).then(() => {
                resetPageReq();
                elMessage(`???${row.id}???????????????`);
            });
        });
    };
    return {
        pageNum,
        pageSize,
        totalPage,
        tableListData,
        tableListReq,
        dateRangePacking,
        multipleSelection,
        handleSelectionChange,
        handleCurrentChange,
        handleSizeChange,
        resetPageReq,
        multiDelBtnDill,
        tableDelDill
    };
};
