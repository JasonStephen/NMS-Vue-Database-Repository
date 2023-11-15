new Vue({
    el: '#editdata',
    data() {
        return {
            csvData: [],
            searchQuery: '',
            searchResults: [],
            editingIndex: null,
            newRecord: {},
            hiddenColumns: ['ID', '隐藏状态', '发现者ID'], //需要隐藏的列名
            showAdvanced: false,
            sortOptions: [],
        };
    },
    mounted() {
        // 在组件加载后从服务器获取 CSV 数据
        this.getCsvData();

        // // 清空排序选项数组，确保每次都是初始状态
        // this.sortOptions = [];

        // 在默认排序下按照 ID 降序排序
        this.toggleSort('ID');
    },
    methods: {
        getCsvData() { //返回CSV数据

            fetch('http://localhost:3000/get-csv')
                .then(response => response.json())
                .then(data => {
                    this.csvData = this.parseCsvData(data);
                    // 初次加载时显示所有数据
                    this.search();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        },

        parseCsvData(data) { //在这个地方添加需要转换的字符类型
            // 初始化 CSV 数据并转换 ID 列为整数类型
            return data.map(row => {
                // 使用解构赋值创建新的对象以避免直接修改原始数据
                const newRow = { ...row };

                // 将 ID 列转换为整数类型
                if (newRow.hasOwnProperty('ID')) {
                    newRow.ID = parseInt(newRow.ID, 10);
                }

                return newRow;
            });
        },

        toggleAdvanced() {
            this.showAdvanced = !this.showAdvanced;
        },

        toggleSort(column) {
            const index = this.sortOptions.findIndex(opt => opt.column === column);
        
            if (index === -1) {
                // 如果没有排序选项，直接指向当前列并添加降序排序
                this.sortOptions = [{ column, order: 'desc' }];
                console.log(`实现${column}降序1`);
            } else if (this.sortOptions[index].order === 'desc') {
                // 如果当前是降序，切换为升序
                this.sortOptions[index].order = 'asc';
                console.log(`实现${column}升序2`);
            } else {
                // 如果当前是升序，或是默认排序，切换为仅按照 ID 列降序排序
                this.sortOptions = [{ column: 'ID', order: 'desc' }];
                console.log('仅按照 ID 列降序排序3');
            }
        
            // 更新排序后的结果
            this.sortResults();
        },        
    
        getSortIndicator(column) {
            const sortOption = this.sortOptions.find(opt => opt.column === column);
    
            if (sortOption) {
                return sortOption.order === 'desc' ? '降序' : '升序';
            }
    
            return '';
        },
    
        sortResults() {
            this.searchResults.sort((a, b) => {
                for (const { column, order } of this.sortOptions) {
                    const aValue = a[column];
                    const bValue = b[column];
    
                    // 处理 undefined 或 null 值
                    if (aValue === undefined || aValue === null) {
                        return order === 'desc' ? 1 : -1;
                    }
                    if (bValue === undefined || bValue === null) {
                        return order === 'desc' ? -1 : 1;
                    }
    
                    // 根据类型进行比较
                    const result = typeof aValue === 'string' && typeof bValue === 'string'
                        ? aValue.localeCompare(bValue)
                        : aValue < bValue ? -1 : (aValue > bValue ? 1 : 0);
    
                    // 根据排序顺序返回结果
                    return order === 'desc' ? -result : result;
                }
                return 0;
            });
        },

        search() { //带过滤的搜索功能
            if (!this.searchQuery) {
                // 如果搜索框为空，显示所有数据
                this.searchResults = this.csvData.filter(row => row['隐藏状态'] !== '1');
                return;
            }
        
            this.searchResults = this.csvData.filter(row => {
                for (const key in row) {
                    if (key !== '隐藏状态' && row[key].toString().toLowerCase().includes(this.searchQuery.toLowerCase())) {
                        return true;
                    }
                }
                return false;
            });
        },

        editRow(index) { //编辑行
            this.editingIndex = index;
        },

        addRow() {
            // 如果正在编辑其他行，先保存编辑
            if (this.editingIndex !== null) {
                this.saveEdit();
            }
        
            // 在添加行之前，你可以初始化新行的数据，例如：
            this.newRecord = {};
        
            // 获取 CSV 文件的列名
            const columns = Object.keys(this.csvData[0]);
        
            // 遍历列名，为新行的每个字段设置默认值
            columns.forEach(column => {
                if (!this.newRecord.hasOwnProperty(column)) {
                    // 如果字段不存在于新行中，设置默认值
                    if (column === 'ID') {
                        const lastId = this.csvData.length > 0 ? this.csvData[this.csvData.length - 1].ID : 0;
                        this.newRecord[column] = lastId + 1;
                    } else {
                        this.newRecord[column] = ''; // 设置其他字段的默认值
                    }
                    // 其他字段的默认值设置...
                }
            });
        
            // 将新行的数据添加到数据数组中
            this.csvData.push(this.newRecord);
        
            // 设置新添加的行为当前正在编辑的行
            this.editingIndex = this.csvData.length - 1;
        
            // 重新执行搜索，确保新添加的行也能被显示
            this.search();
        },
        

        changeHiddenState(index) { //伪删除
            // 设置 '隐藏状态' 列的值为1
            this.searchResults[index]['隐藏状态'] = '1';
    
            // 如果需要，可以将更改后的数据保存到服务器
            this.saveToServer();
    
            // 清除编辑状态
            this.editingIndex = null;

            // 重新执行搜索，确保新添加的行也能被显示
            this.search();
        },

        saveEdit() { //保存编辑
            // 执行任何必要的验证或保存逻辑
            this.editingIndex = null;

            // 发送更新后的数据到服务器保存
            this.saveToServer();

            // 如果编辑在最后一行，添加新行
            if (this.editingIndex === this.csvData.length - 1) {
                this.addRow();
            }

            this.search();
        },

        cancelEdit() {
            // 取消编辑，恢复原始数据
            if (this.editingIndex !== null) {
                // 如果有正在编辑的行，将编辑状态设置为null
                this.editingIndex = null;
    
                // 如果有修改过的数据，恢复为原始数据
                this.searchResults[this.editingIndex] = { ...this.csvData[this.editingIndex] };
            }
        },
        
        saveToServer() { //发送更新后的 CSV 数据到服务器
            fetch('http://localhost:3000/save-csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.csvData),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // 如果需要，处理服务器的响应
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
    },
});
