new Vue({
    el: '#editdata',
    data() {
        return {
            csvData: [],
            searchQuery: '',
            searchResults: [],
            editingIndex: null,
            newRecord: {},
            hiddenColumns: ['ID', '发现者ID'], //需要隐藏的列名
            showAdvanced: false,
            sortOptions: [],
            showDetailsIndex: null, // 用于追踪显示详情的索引
            sortBy: '发现时间', // 初始排序列
            sortOrder: 'desc', // 初始排序顺序
        };
    },
    mounted() {
        // 在组件加载后从服务器获取 CSV 数据
        this.getCsvData();

        // // 清空排序选项数组，确保每次都是初始状态
        // this.sortOptions = [];

        // 初次加载时按照“发现时间”的列降序排序
        this.toggleSort('发现时间');

        
    },
    methods: {
        getCsvData() { //返回CSV数据
            console.log('[COMPLETED] Get CSV data.');
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

        parseCsvData(data) {
            console.log('[COMPLETED] Parse CSV data.');
            // 初始化 CSV 数据并转换 ID 和浏览量 列为整数类型
            return data.map(row => {
                // 使用解构赋值创建新的对象以避免直接修改原始数据
                const newRow = { ...row };
        
                // 将 ID 列转换为整数类型
                if (newRow.hasOwnProperty('ID')) {
                    newRow.ID = parseInt(newRow.ID, 10);
                }
        
                // 将浏览量列转换为整数类型，假设浏览量列为 '浏览量'
                if (newRow.hasOwnProperty('浏览量')) {
                    newRow.浏览量 = parseInt(newRow.浏览量, 10);
                }
        
                return newRow;
            });
        },
        

        toggleAdvanced() {
            console.log('[COMPLETED] Toggle advanced options.');
            this.showAdvanced = !this.showAdvanced;
        },

        toggleSort(column) {
            console.log('[COMPLETED] Toggle sort.');
            // 切换排序列
            if (this.sortBy === column) {
                // 如果点击的是当前排序列，不需要切换排序顺序，直接返回
                return;
            }

            // 如果点击的是新的列，切换到升序
            this.sortBy = column;
            this.sortOrder = 'desc';

            // 更新排序后的结果
            this.sortResults();

            // 关闭对应的窗口
            this.closeDetails();
            this.cancelEdit();
        },

        getSortIndicator(column) {
            console.log('[COMPLETED] Get sort indicator.');
            // 根据当前排序状态返回排序指示符
            if (this.sortBy === column) {
                return this.sortOrder === 'desc' ? '降序' : '升序';
            }
            return '';
        },

        sortResults() {
            console.log('[COMPLETED] Sort results.');
            this.searchResults.sort((a, b) => {
                const aValue = a[this.sortBy];
                const bValue = b[this.sortBy];
        
                // 处理 undefined 或 null 值
                if (aValue === undefined || aValue === null) {
                    return this.sortOrder === 'desc' ? 1 : -1;
                }
                if (bValue === undefined || bValue === null) {
                    return this.sortOrder === 'desc' ? -1 : 1;
                }
        
                // 根据类型进行比较
                const result = typeof aValue === 'string' && typeof bValue === 'string'
                    ? aValue.localeCompare(bValue)
                    : aValue < bValue ? -1 : (aValue > bValue ? 1 : 0);
        
                // 根据排序顺序返回结果
                return this.sortOrder === 'desc' ? -result : result;
            });
        },
        

        getSortButtonColor(column) {
            return this.sortBy === column ? 'blue' : 'black';
        },

        search() {
            console.log('[COMPLETED] Search.');
            // 清空排序选项数组
            this.sortOptions = [];
        
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
        
            // 在清空排序选项后，重新执行排序
            this.sortResults();
        },

        addRow() {
            console.log('[COMPLETED] Add row.');
            // 如果正在编辑其他行，先保存编辑
            if (this.editingIndex !== null) {
                this.saveEdit();
                console.log('[AddRow] run saveEdit()');
            }
        
            // 在添加行之前，你可以初始化新行的数据，例如：
            this.newRecord = {};

            // 设置"发现时间"列的值为今天的年月日
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
        
            // 获取 CSV 文件的列名
            const columns = Object.keys(this.csvData[0]);
        
            // 遍历列名，为新行的每个字段设置默认值
            columns.forEach(column => {
                if (!this.newRecord.hasOwnProperty(column)) {
                    // 如果字段不存在于新行中，设置默认值
                    if (column === 'ID') {
                        const lastId = this.csvData.length > 0 ? this.csvData[this.csvData.length - 1].ID : 0;
                        this.newRecord[column] = lastId + 1;
                    } else if (column === '发现时间') {
                        this.newRecord[column] = `${year}-${month}-${day}`;
                    } else if (column === '隐藏状态') {
                        this.newRecord[column] = '0';
                    } else {
                        this.newRecord[column] = ''; // 设置其他字段的默认值
                    }
                    // 其他字段的默认值设置...
                }
            });
        
            // 将新行的数据添加到数据数组中
            this.csvData.push(this.newRecord);
            console.log('[AddRow] Add new data to Array.');
        
            // 设置新添加的行为当前正在编辑的行
            this.editingIndex = this.csvData.length - 1;
        
            // 重新执行搜索，确保新添加的行也能被显示
            this.search();
        
            // 调用EditDetails去编辑当前添加的行
            this.editDetails(this.editingIndex);

            this.closeDetails();
        },
        
        editDetails(index) {
            console.log('[COMPLETED] Edit details.');
            // 设置编辑状态为当前详情信息的索引
            this.editingIndex = index;

            // 关闭详情信息
            this.closeDetails();
        },
    
        deleteDetails(index) {
            console.log('[COMPLETED] Delete details.');
            // 在 searchResults 数组中找到相应的数据
            const itemToDelete = this.searchResults[index];
            // 在 csvData 数组中找到该数据的索引
            const indexInCsvData = this.csvData.findIndex(item => item === itemToDelete);
            // 在 csvData 数组中移除相应的数据
            if (indexInCsvData !== -1) {
                this.csvData.splice(indexInCsvData, 1);
            }
            // 如果需要，可以将更改后的数据保存到服务器
            this.saveToServer();
            // 清除编辑状态和详情视图
            this.editingIndex = null;
        },

        saveEdit() {
            console.log('[COMPLETED] Save edit.');
            // 执行任何必要的验证或保存逻辑
            this.editingIndex = null;
    
            // 发送更新后的数据到服务器保存
            this.saveToServer();
    
            // 如果编辑在最后一行，添加新行
            if (this.editingIndex === this.csvData.length - 1) {
                this.addRow();
            }
    
            this.search();
    
            console.log('Edited Row:', this.searchResults[this.editingIndex]);
            console.log('CSV Data:', this.csvData);
        },

        viewDetails(index) {
            console.log('[COMPLETED] View details.');
            // 设置 showDetailsIndex 为当前点击的行的索引
            this.showDetailsIndex = index;
            
            // 在这里增加对浏览量字段的加一操作
            if (this.searchResults[index].hasOwnProperty('浏览量')) {
                this.searchResults[index]['浏览量'] = (this.searchResults[index]['浏览量'] || 0) + 1;
        
                // 如果需要，你也可以将更新后的数据保存到服务器
                this.saveToServer();
            }
            this.cancelEdit();
        },
        
        closeDetails() {
            console.log('[COMPLETED] Close details.');
            // 关闭详情视图，将 showDetailsIndex 设置为 null
            this.showDetailsIndex = null;
        },

        cancelEdit() {
            console.log('[COMPLETED] Cancel edit.');
            // 取消编辑，恢复原始数据
                this.editingIndex = null;
    
                // 如果有修改过的数据，恢复为原始数据
                this.searchResults[this.editingIndex] = { ...this.csvData[this.editingIndex] };
        },
        
        saveToServer() { //发送更新后的 CSV 数据到服务器
            console.log('[COMPLETED] Save to server.');
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