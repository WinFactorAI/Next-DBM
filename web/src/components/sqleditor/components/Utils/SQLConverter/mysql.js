//  mysql 转换器 UI 操作转换成SQL语句
import { debugLog } from '../../../../../common/logger';

// 字典解析器
const fieldSql= (item) =>{
    let fieldSqlstr = `\n\t\`${item.name}\` `
                
    if(item.type ){
        if(item.type == 'varchar'){
            fieldSqlstr += ` ${item.type}(${item.len})`
        } else {
            fieldSqlstr += ` ${item.type}(${item.len}, ${item.port})`
        }
    }
    if(item.Unsigned){
        fieldSqlstr += ' UNSIGNED'
    }
    if(item.ZeroFill){
        fieldSqlstr += ' ZEROFILL'
    }
    if(item.isNull){
        fieldSqlstr += ' NOT NULL'
    }
    if(item.DefaultValue ){
        if(item.DefaultValue == "EMPTY STRING")
            fieldSqlstr += ' DEFAULT \'\''  
    }
    if(item.AutomaticIncrement){
        fieldSqlstr += ' AUTO_INCREMENT'
    }
    if(item.comment){
        fieldSqlstr += ' COMMENT \'' + item.comment + '\''
    }
    return fieldSqlstr
}
// 索引解析器
const indexSql = (item) =>{
    let indexSqlStr='\n\t'
    if(item.indexType && item.indexType !== 'NORMAL'){
        indexSqlStr += ' '+item.indexType
    }
    if(item.name){
        let indexFieldsStr = ''
        item.fileds?.map((field,index)=>{
            if(index===0){
                indexFieldsStr += '\`'+field +'\`'
            } else {
                indexFieldsStr += ',\`'+field +'\`'
            }
        })
        indexSqlStr += ' INDEX \''+item.name+'\' (' +indexFieldsStr +')'

    }

    if(item.keyBlockSize){
        indexSqlStr += ' KEY_BLOCK_SIZE = '+item.keyBlockSize
    }

    if(item.indexFunction){
        indexSqlStr += ' USING '+item.indexFunction
    }

    if(item.btreeWithParser){
        indexSqlStr += ' WITH PARSER `' + item.btreeWithParser + '`'
    }
  
    if(item.remark?.length >0){
        indexSqlStr += ' COMMENT \'' + item.remark + '\''
    }
    return indexSqlStr;
}
// 外键解析器
const foreignKeyIndexSql = (item) =>{
    let fields =''
    item.columns?.map((columnsItem) => {
        fields+= '`'+columnsItem+'`,'
    })
    // 删除随后一个,
    fields = fields.substring(0,fields.length-1)
   
    let foreignKeySqlStr = 'ALTER TABLE `' + item.database + '`.`' + item.table + '` ADD INDEX (' +fields+'); \n\n'
    return foreignKeySqlStr;
}
const foreignKeySql = (item) =>{

    let fields =''
    item.columns?.map((columnsItem) => {
        fields+= '`'+columnsItem+'`,'
    })
    // 删除随后一个,
    fields = fields.substring(0,fields.length-1)

    let foreignKeySqlStr = '\n\tCONSTRAINT `'+item.name+'` FOREIGN KEY (`'+item.field+'`) REFERENCES `'+item.database+'`.`'+item.table+'` ('+fields+')'
    if(item.deleteActions){
        foreignKeySqlStr += ' ON DELETE '+item.deleteActions
    }
    if(item.updateActions){
        foreignKeySqlStr += ' ON UPDATE '+item.updateActions   
    }
    return foreignKeySqlStr
}
// 触发器解析器
export const triggerSql = (item) =>{
    
    return 'CREATE TRIGGER `'+item.name+'` '+item.triggerTimeType+' '+item.triggerActionType+' ON `'+item.table+'` FOR EACH ROW '+item.sql +';'
}

export const createTable = (params) =>{
    debugLog(" createTable ",params)

    // 动态拼接SQL
    let fieldSqlStr = '';
    let sql = `CREATE TABLE ${params.tableName} (`
    if(params.fieldData?.length>0){
        params.fieldData.map((item,index)=>{
            if(index===0){
                sql += fieldSql(item)
            } else {
                sql += `,`+fieldSql(item)
            }
        })
        if(params.fieldData.length >1){
            sql += ','
        }
    }  

    if(params.indexData?.length>0){
        params.indexData.map((item,index)=>{
            if(index===0){
                sql += indexSql(item)  
            } else {
                sql += `,`+ indexSql(item) 
            }
        })
    }

    // 外键解析
    if(params.foreignKeyData?.length>0){
        params.foreignKeyData.map((item,index)=>{
            if(index===0){
                sql += foreignKeySql(item)
            } else {
                sql += `,`+foreignKeySql(item)
            }
        })
        if (params.foreignKeyData?.length > 1) {
            sql += `,`
        }
    }
    // 外间索引解析
    if(params.foreignKeyData?.length>0){
        params.foreignKeyData.map((item,index)=>{
            fieldSqlStr += foreignKeyIndexSql(item)
        })
    }

    // 生成主键
    if(params.fieldData?.length>0){
        let keys = ''
        params.fieldData.map((item,index)=>{
            if(index===0){
                if(item.isPrimaryKey){
                    keys += `\`${item.name}\``
                }
            } else {
                if(item.isPrimaryKey){
                    keys += `,\`${item.name}\``
                }
            }
        })
        if(keys.length > 0){
            sql+= `\n\tPRIMARY KEY (${keys}),` 
        }
    }  
   
    sql +=`\n\n)` 
    // debugLog(" params.optionData ",params.optionData)
    if(params.optionData){
        if(params.optionData.Engines){
            sql += ' ENGINE = '+params.optionData.Engines; 
        }
        if(params.optionData.Charsets){
            sql += ' CHARACTER SET = '+params.optionData.Charsets; 
        }
        if(params.optionData.Collations){
            sql += ' COLLATE = '+params.optionData.Collations; 
        }
        
        if(params.optionData.auto){
            sql += ' AUTO_INCREMENT = '+params.optionData.auto; 
        }
        if(params.optionData.dataDir){
            sql += ' DATA DIRECTORY = \''+params.optionData.dataDir+'\''; 
        }
        if(params.optionData.indexDir){
            sql += ' INDEX DIRECTORY = \''+params.optionData.indexDir+'\''; 
        }
        if(params.optionData.avageRowLen){
            sql += ' AVG_ROW_LENGTH = '+params.optionData.avageRowLen; 
        }
        if(params.optionData.minRowCount){
            sql += ' MIN_ROWS = '+params.optionData.minRowCount; 
        }
        if(params.optionData.maxRowCount){
            sql += ' MAX_ROWS = '+params.optionData.maxRowCount; 
        }
        if(params.optionData.keyBlockSize){
            sql += ' KEY_BLOCK_SIZE = '+params.optionData.packKeysSize; 
        }
        if(params.optionData.RowFormat){
            sql += ' ROW_FORMAT = '+params.optionData.RowFormat; 
        }
        if(params.optionData.statsAuotRecalc){
            sql += ' STATS_AUTO_RECALC = '+params.optionData.DataOptions1; 
        }
        if(params.optionData.statsPersistent){
            sql += ' STATS_PERSISTENT = '+params.optionData.DataOptions2; 
        }
        if(params.optionData.indexDir){
            sql += ' STATS_SAMPLE_PAGES = '+params.optionData.indexDir; 
        }
        if(params.optionData.encryption){
            sql += ' ENCRYPTION = \'Y\''; 
        }

        if(params.optionData.TableSpace){
            sql += ' TABLESPACE = '+params.optionData.TableSpace; 
        }
    }  
    if(params.remark?.length>0){
        sql += ` COMMENT = '${params.remark}' ;`
    } else {
        sql += `;`
    }
    debugLog(" createTable sql ",sql)
    // 外建索引生成完整SQL
    if(fieldSqlStr.length>0){
        sql = fieldSqlStr + sql
    }

    // 触发器生成完整SQL
    if(params.triggerData?.length>0){
        params.triggerData.map((item,index)=>{
            sql += `\n\n${triggerSql(item)}`
        })
    }

    return sql
    // return `CREATE TABLE ${tableName} (${fieldData.join(',')});`
}

// 创建表SQL解析成结构信息

// 字段解析器
const parseFieldSql = (fieldSql) => {
    // debugLog(" ## parseFieldSql fieldSql ",fieldSql)
    // /`(\w+)`\s+(\w+)(?:\((\d+)(?:, (\d+))?\))?/
    //  \s+(?!CONSTRAINT)\s+`(\w+)`\s+(\w+)(?:\((\d+)(?:, (\d+))?\))?
    const field = {};
    const matches = fieldSql.match(/`(\w+)`\s+(\w+)(?:\((\d+)(?:, (\d+))?\))?/);
    if (matches) {
        // 如何生成唯一key
        field.key = new Date().getTime() + Math.random().toString(36).substr(2, 9);
        // debugLog(" ## parseFieldSql matches field.key ",field.key)

        field.name = matches[1];
        field.type = matches[2];
        field.len = parseInt(matches[3], 10);
        if (matches[4]) {
            field.port = parseInt(matches[4], 10);
        }
    }
    if (fieldSql.includes('UNSIGNED')) field.Unsigned = true;
    if (fieldSql.includes('ZEROFILL')) field.ZeroFill = true;
    if (fieldSql.includes('NOT NULL')) field.isNull = false;
    if (fieldSql.includes('AUTO_INCREMENT')) field.AutomaticIncrement = true;
    // debugLog(" ## parseFieldSql fieldSql ",fieldSql)
    const commentMatch = fieldSql.match(/COMMENT\s+'(.+?)'/);
    // debugLog(" ## parseFieldSql commentMatch ",commentMatch)
    if (commentMatch) field.comment = commentMatch[1];
    return field;
};

// 索引解析器
const parseIndexSql = (indexSql) => {
    debugLog(" ## parseIndexSql indexSql ",indexSql)
    //  /INDEX\s+'(\w+)'\s+\((.+?)\)/ 
    const index = {};
    const matches = indexSql?.match(/(UNIQUE\s|SPATIAL\s|NORMAL\s|FULLTEXT\s|\s)?KEY\s+`?(\w+)?`?\s+\(`([\w, ]+)\`.*?\)\s*(USING\s+BTREE|USING\s+HASH)?/);
    if (matches) {
        index.key = new Date().getTime() + Math.random().toString(36).substr(2, 9);
        debugLog(" ## parseIndexSql matches ",matches)
        if (matches[1] === " ") {
            index.indexType = 'NORMAL';
        } else {
            index.indexType = matches[1];
        }
        index.name = matches[2];
        index.fileds = matches[3].split(',').map(field => field.replace(/`/g, '').trim());
        
    }
 
    if (matches && indexSql.includes('USING')) {
        const funcMatch = indexSql.match(/USING\s+(\w+)/);
        debugLog(" ## parseIndexSql funcMatch ",funcMatch)
        if (funcMatch) {
            index.indexFunction = funcMatch[1];
        }
    }
    const commentMatch = indexSql?.match(/COMMENT\s+'(.+?)'/);
    if (commentMatch) index.remark = commentMatch[1];
    // debugLog(" ## parseIndexSql commentMatch ",commentMatch)
    return index;
};

// 外键解析器
const parseForeignKeySql = (foreignKeySql) => {
    const foreignKey = {};
    const matches = foreignKeySql.match(/CONSTRAINT\s+`(\w+)`\s+FOREIGN KEY\s+\(`(\w+)`\)\s+REFERENCES\s+`(\w+)`\s+\(`(\w+)`\)\s+ON\s+(DELETE)\s+(NO ACTION|CASCADE|RESTRICT|SET NULL)\s+ON\s+(UPDATE)\s+(NO ACTION|CASCADE|RESTRICT|SET NULL)/);
    if (matches) {
        debugLog(" ## parseForeignKeySql matches ",matches)
        foreignKey.name = matches[1];
        foreignKey.field = matches[2];
        foreignKey.database = "",
        foreignKey.table = matches[3];
        foreignKey.columns = matches[4].split(',').map(field => field.replace(/`/g, '').trim());
        // = matches[5];
        foreignKey.deleteActions = matches[6];
        foreignKey.updateActions = matches[8];
    }
    // if (matches && foreignKeySql.includes('ON DELETE')) {
    //     const deleteMatch = foreignKeySql.match(/ON DELETE\s+(\w+)/);
    //     if (deleteMatch) foreignKey.deleteActions = deleteMatch[1];
    // }
    // if (matches && foreignKeySql.includes('ON UPDATE')) {
    //     const updateMatch = foreignKeySql.match(/ON UPDATE\s+(\w+)/);
    //     if (updateMatch) foreignKey.updateActions = updateMatch[1];
    // }
    return foreignKey;
};


function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
// 解析创建表语句
export const parseCreateTableSql = (params) => {
    debugLog(" parseCreateTableSql ",params)
    const structure = {
        tableName: '',
        fieldData: [],
        indexData: [],
        foreignKeyData: [],
        triggerData: [],
        optionData: {},
        remark: ''
    };

    // 提取表名
    const tableMatch = params.sql.match(/CREATE TABLE\s+`(\w+)`\s+\(/);
    if (tableMatch) {
        structure.tableName = tableMatch[1];
    }

    // 提取字段   /`(\w+)`\s+(\w+)(\(\d+(?:,\s?\d+)?\))?\s+DEFAULT\s+NULL/g
    const fieldMatches = params.sql.match(/`[^`]+`\s+[\w\W]+?(?=,|$)/g);
    if (fieldMatches) {
        structure.fieldData = fieldMatches
                                .map(fieldSql => parseFieldSql(fieldSql))
                                .filter(field => {
                                    // debugLog(" ## parseCreateTableSql field ",field)
                                    if(Object.keys(field).length > 0 && field.type.includes('FOREIGN')){
                                        return false
                                    }
                                    return Object.keys(field).length > 0;
                                });
    }

    // 提取主键
    const primaryKeyMatch = params.sql.match(/PRIMARY KEY\s+\((.+?)\)/);
    if (primaryKeyMatch) {
        const primaryKey =  primaryKeyMatch[1].split(',').map(field => field.replace(/`/g, '').trim())
        primaryKey.map(item => {
            structure.fieldData.map(item2 => {
                if(item2.name == item){
                    item2.isPrimaryKey = true
                }
            })
        })
    }
    

    // 提取索引
    const indexMatches = params.sql.match(/(UNIQUE\s|SPATIAL\s|NORMAL\s|FULLTEXT\s|\s)?KEY\s+`?(\w+)?`?\s+\(`([\w, ]+)\`.*?\)\s*(USING\s+BTREE|USING\s+HASH)?/);
    if (indexMatches) {
     let  indexData = indexMatches.map(indexSql => parseIndexSql(indexSql))
                                   .filter(field => Object.keys(field).length > 0);
    //  debugLog(" ## parseCreateTableSql indexData ",indexData)
     structure.indexData = indexData
    }

    // 提取外键
    const foreignKeyMatches = params.sql.match(/CONSTRAINT\s+`(\w+)`\s+FOREIGN KEY\s+\(`(\w+)`\)\s+REFERENCES\s+`(\w+)`\s+\(`(\w+)`\)\s+ON\s+(DELETE)\s+(NO ACTION|CASCADE|RESTRICT|SET NULL)\s+ON\s+(UPDATE)\s+(NO ACTION|CASCADE|RESTRICT|SET NULL)/);
    if (foreignKeyMatches) {
        structure.foreignKeyData = foreignKeyMatches.map(foreignKeySql => parseForeignKeySql(foreignKeySql))
                                                    .filter(field => Object.keys(field).length > 0);
    }

    // 提取触发器
    const triggerMatches = params.sql.match(/CREATE TRIGGER\s+`[^`]+`\s+[\w\W]+?;/g);
    if (triggerMatches) {
        structure.triggerData = triggerMatches.map(triggerSql => parseTriggerSql(triggerSql));
    }

    // 提取表选项
    const optionMatches = params.sql.match(/(?:ENGINE\s*=\s*\w+|CHARACTER\s+SET\s*=\s*\w+|COLLATE\s*=\s*\w+|AUTO_INCREMENT\s*=\s*\d+|DATA\s+DIRECTORY\s*=\s*'[^']*'|INDEX\s+DIRECTORY\s*=\s*'[^']*'|AVG_ROW_LENGTH\s*=\s*\d+|MIN_ROWS\s*=\s*\d+|MAX_ROWS\s*=\s*\d+|KEY_BLOCK_SIZE\s*=\s*\d+|ROW_FORMAT\s*=\s*\w+|STATS_AUTO_RECALC\s*=\s*\w+|STATS_PERSISTENT\s*=\s*\w+|STATS_SAMPLE_PAGES\s*=\s*\w+|ENCRYPTION\s*=\s*'[^']*'|TABLESPACE\s*=\s*\w+)/g);
    // debugLog(" ## parseCreateTableSql optionMatches ",optionMatches)
    if (optionMatches) {
        optionMatches.forEach(option => {
            const [key, value] = option.split(/\s*=\s*/);
            debugLog(" ## parseCreateTableSql key, value  ",key, value)
            switch (key) {
                case 'ENGINE':
                    structure.optionData.Engines = value;
                    break;
                case 'CHARACTER SET':
                    structure.optionData.Charsets = value;
                    break;
                case 'COLLATE':
                    structure.optionData.Collations = value;
                    break;
                case 'AUTO_INCREMENT':
                    structure.optionData.auto = value;
                    break;
                case 'DATA DIRECTORY':
                    structure.optionData.dataDir = value;
                    break;
                case 'INDEX DIRECTORY':
                    structure.optionData.indexDir = value;
                    break;
                case 'AVG_ROW_LENGTH':
                    structure.optionData.avageRowLen = value;
                    break;
                case 'MIN_ROWS':
                    structure.optionData.minRowCount = value;
                    break;
                case 'MAX_ROWS':
                    structure.optionData.maxRowCount = value;
                    break;
                case 'KEY_BLOCK_SIZE':
                    structure.optionData.packKeysSize = value;
                    break;
                case 'ROW_FORMAT':
                    structure.optionData.RowFormat = value;
                    break;
                case 'STATS_AUTO_RECALC':
                    structure.optionData.DataOptions1 = value;
                    break;
                case 'STATS_PERSISTENT':
                    structure.optionData.DataOptions2 = value;
                    break;
                case 'STATS_SAMPLE_PAGES':
                    structure.optionData.indexDir = value;
                    break;
                case 'ENCRYPTION':
                    structure.optionData.encryption = value;
                    break;
                case 'TABLESPACE':
                    structure.optionData.TableSpace = value;
                    break;
            }
        });
    }
    // debugLog(" ## parseCreateTableSql  structure.optionData ", structure.optionData)

    // 提取备注 
    const remarkMatch = params.sql.match(/COMMENT\s+'(.+?)'/);
    if (remarkMatch) {
        structure.remark = remarkMatch[1];
    }

    return structure;
};


const parseDDL = (ddl) => {
    const result = {};
    const lines = ddl.split('\n').map(line => line.trim());

    for (let line of lines) {
        if (line.startsWith('CREATE TABLE')) {
            result.table = line.match(/CREATE TABLE (\w+)/)[1];
        } else if (line.includes('PRIMARY KEY')) {
            // 忽略主键声明
        } else if (line && !line.startsWith(')')) {
            const parts = line.split(' ').filter(part => part);
            const fieldName = parts[0];
            const fieldType = parts.slice(1).join(' ').replace(/,$/, '');
            result[fieldName] = fieldType;
        }
    }
    return result;
}

const generateAlterStatements = (originalDDL, modifiedDDL) => {
    const original = parseDDL(originalDDL);
    const modified = parseDDL(modifiedDDL);

    const alterStatements = [];

    for (let key in modified) {
        if (key !== 'table') {
            if (!original[key]) {
                alterStatements.push(`ADD ${key} ${modified[key]}`);
            } else if (original[key] !== modified[key]) {
                alterStatements.push(`MODIFY ${key} ${modified[key]}`);
            }
        }
    }

    for (let key in original) {
        if (key !== 'table' && !modified[key]) {
            alterStatements.push(`DROP COLUMN ${key}`);
        }
    }

    return alterStatements.length
        ? `ALTER TABLE ${modified.table} ${alterStatements.join(', ')};`
        : '-- No changes detected';
}

export const alterTable = (params) =>{
    debugLog(" alterTable ",params)
    const alterSQL = generateAlterStatements(params.originalDDL, params.modifiedDDL);
    return alterSQL
}
// 创建视图
export const createView = (params) =>{
    debugLog(" createView ",params)

    // 动态拼接SQL  ;
    let fieldSqlStr = '';
    let sql = `CREATE `
    if(params.optionData){
       if(params.optionData.algorithm){
         sql +=  ' ALGORITHM = ' +params.optionData.algorithm
       }
       if(params.optionData.legislator){
        sql +=  ' DEFINER = '+params.optionData.legislator
      }
    }
    sql += ` VIEW ${params.viewName} AS`
    if(params.optionData){
       if(params.optionData.security){
         sql +=  ' SQL SECURITY ' + params.optionData.security
       }
    }
    sql += ` ${params.sql} `

    if(params.optionData){
        if(params.optionData.checkOptions){
            sql +=  ' WITH '+ params.optionData.checkOptions+' CHECK OPTION'
          }
    }
    sql +=`;\n\n` 
    return sql
}

export const createFunction = (params) =>{
    let sql = '';
    // `CREATE FUNCTION `+params.functionName+`()`
    sql += params.sql;
    sql +=`\n\n` 
    return sql
}
export const createProcedure = (params) =>{
    let sql = '';
    // `CREATE PROCEDURE `+params.psrocedureName+`()`
    sql += params.sql;
    sql +=`\n\n` 
    return sql
}

export const createDatabase = (params) =>{
    let sql = `CREATE DATABASE IF NOT EXISTS ` +params.database
    sql += '\n DEFAULT CHARACTER SET '+params.charset;
    sql += '\n DEFAULT COLLATE ' +params.collation;
    sql += ';\n' 
    return sql
}
export const dropDatabase = (params) =>{
    return `DROP DATABASE IF EXISTS ` +params.database
}

// 获取全部配置信息
export const getNow =() =>{
    return 'SELECT NOW();'
}
export const getAllVariables =() =>{
    return 'SHOW VARIABLES'
}

export const getAllDatabases = () =>{
    // return `SHOW DATABASES;`
    return 'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA ORDER BY SCHEMA_NAME ASC;'
}

export const getAllTables = (params) =>{
    // return 'SHOW TABLES FROM \`'+params.database+'\`;'
    return 'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = \''+params.database+'\' AND TABLE_TYPE= \'BASE TABLE\';'
    // return 'SHOW TABLE STATUS FROM \`'+params.database+'\` WHERE Comment != \'view\''
    // return 'SHOW TABLES FROM '+params.database
}
export const getAllColumns = (params) =>{
    return 'DESCRIBE \`'+params.database+'\`.\`'+params.tableName+'\`;'
}
export const getAllKeys = (params) =>{
    // return 'SHOW KEYS FROM  \`'+params.database+'\`.\`'+params.tableName+'\`;'
    return 'SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = \''+params.tableName+'\' AND REFERENCED_TABLE_NAME IS NOT NULL;'
}   
export const getAllIndexs = (params) =>{
    return 'SHOW INDEX FROM \`'+params.database+'\`.\`'+params.tableName+'\`;'
}
export const getAllViews = (params) =>{
    return 'SHOW TABLE STATUS FROM \`'+params.database+'\` WHERE Comment = \'view\';'
    // return 'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = \`'+params.database+'\` ADN TABLE_TYPE= \'VIEW\';'
}
export const getAllFunctions = (params) =>{
    return 'SHOW FUNCTION STATUS WHERE DB = \''+params.database+'\';'
}
export const getAllProcedures = (params) =>{
    return 'SHOW PROCEDURE STATUS WHERE DB = \''+params.database+'\';'
}
export const getAllSqls = (params) =>{
    return 'SHOW PROCEDURE STATUS WHERE DB = \''+params.database+'\';'
}

export const getTableDDL = (params) =>{
    return 'SHOW CREATE TABLE \`'+params.database+'\`.\`'+params.tableName+'\`;'
}

export const dropTable = (params) =>{
    return `DROP TABLE \``+params.database+'\`.\`'+params.tableName+`\`;`
}

export const addTableColumn = (tableName,column) =>{
    return `ALTER TABLE ${tableName} ADD COLUMN ${column};`
}
export const deleteTableColumn = (tableName,column) =>{
    return `ALTER TABLE ${tableName} DROP COLUMN ${column};`
}
export const updateTableColumn = (tableName,column) =>{
    return `ALTER TABLE ${tableName} MODIFY COLUMN ${column};`
}
export const deleteTable = (tableName) =>{
    return `DROP TABLE ${tableName};`
}
export const renameTable = (params) =>{
    return 'ALTER TABLE \`'+params.database+'\`.\`'+params.oldName+'\` RENAME TO \`'+params.database+'\`.\`'+params.newName+'\`;'
}

export const updateTableName = (oldName,newName) =>{
    return `ALTER TABLE ${oldName} RENAME TO ${newName};`
}
export const updateTableColumnName = (tableName,oldName,newName) =>{
    return `ALTER TABLE ${tableName} CHANGE COLUMN ${oldName} ${newName};`
}
export const updateTableColumnType = (tableName,columnName,newType) =>{
    return `ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${newType};`
}
export const updateTableColumnNullable = (tableName,columnName,newNullable) =>{
    return `ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${newNullable};`
}
export const updateTableColumnDefaultValue = (tableName,columnName,newDefaultValue) =>{
    return `ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${newDefaultValue};`
}
export const updateTableColumnComment = (tableName,columnName,newComment) =>{
    return `ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${newComment};`
}
export const updateTableColumnDetail = (tableName,columnName,newType,newNullable,newDefaultValue,newComment) =>{
    return `ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${newType} ${newNullable} ${newDefaultValue} ${newComment};`
}

// 清空表数据
export const truncateTable = (params) =>{
    return `TRUNCATE TABLE \``+params.database+'\`.\`'+params.tableName+`\`;`
}

// 获取表结构
export const getTableStructure = (tableName) =>{
    return `DESCRIBE ${tableName};`
}

// 查询表数据
export const selectTableData = (params) =>{
    return `SELECT * FROM \``+params.database+'\`.\`'+params.tableName+`\`;`
}

// 删除视图
export const dropView = (params) =>{
    return `DROP VIEW \``+params.database+'\`.\`'+params.viewName+`\`;`
}
// 删除函数
export const dropFunction = (params) =>{
    return `DROP FUNCTION \``+params.database+'\`.\`'+params.functionName+`\`;`
}
// 删除存储过程
export const dropProcedure = (params) =>{
    return `DROP PROCEDURE \``+params.database+'\`.\`'+params.procedureName+`\`;`
}

// 表数据基本操作
export const deleteRow = (params) =>{
    // 通过params.tableColumn 分析获取主建更新字段名称 然后获取对应列的value 的值然后删除
    debugLog(" #### params ",params)
    const primaryKeyColumn = params.tableStruct.find((item) => item[3] === 'PRI');

    if (!primaryKeyColumn) {
        console.error("未找到主键列，请检查 tableStruct 数据结构");
        return '';
    }
    debugLog(" primaryKeyColumn ",primaryKeyColumn)
    debugLog(" params.columns ",params.columns)
    debugLog(" params.values ",params.values)
    var keyColumn = 0;
    params.columns.forEach((item,index)=>{
        if(item === primaryKeyColumn[0]){
            keyColumn = index
        }
    })

    var whereArr = [];
    params.values.forEach((row) => {
      debugLog(" row ",row)
      var cell = row[keyColumn]
      debugLog(" cell ",cell)
      debugLog(" keyColumn ",keyColumn)
      if (/int|bigint|bit/.test(primaryKeyColumn[1])) {
        debugLog(" ## cell ",cell)
        whereArr.push(Number(cell)); // 转换为数值类型
      }
    }); 
    return `DELETE FROM \`${params.database}\`.\`${params.tableName}\` WHERE ${primaryKeyColumn[0]} IN (${whereArr.join(', ')});`;
}
export const insertRow = (params) =>{
    debugLog(" #### params ",params)
    const primaryKeyColumn = params.tableStruct.find((item) => item[3] === 'PRI');

    if (!primaryKeyColumn) {
        console.error("未找到主键列，请检查 tableStruct 数据结构");
        return '';
    }

    const { database, tableName, tableStruct,columns, values } = params;

    // Generate the column names string
    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    debugLog(" params ",params)
    // Generate the values string for multiple rows
    const valuesString = values.map(row => {
        const filteredRow = Object.entries(row)
            .filter(([key]) => key !== 'rowIndex') // Exclude 'rowIndex'
            .map(([_, value]) => value); // Extract values only
        // 根据tableStruct 类型转换数据
        debugLog(" filteredRow ",filteredRow)
        return `(${filteredRow.map((value,index) => {
            const columnItem = columns[index];
            const columnType = tableStruct.find((item) => item[0] === columns[index])[1];
           
            // debugLog(" value ",value)
            if (/int|bigint|bit/.test(columnType)) {
                var newValue = value === '' || value === null ? 0 : value
                if (isNaN(Number(newValue))) {
                    newValue = 0;
                }
                debugLog(" columnItem ",columnItem," columnType ",columnType," 转类型 newValue ",Number(newValue) )
                return newValue ;
            } 
            debugLog(" columnItem ",columnItem," columnType ",columnType," 不转换 value ",value)
            return `'${value.replace(/'/g, "\\'")}'`;
        }
        ).join(', ')})`;
    }).join(',\n');

    // Construct the final SQL statement
    return `INSERT INTO \`${database}\`.\`${tableName}\` (${columnNames}) VALUES ${valuesString};`;
}
export const updateRow = (params) =>{
    debugLog(" #### params ",params)
    const primaryKeyColumn = params.tableStruct.find((item) => item[3] === 'PRI');
    debugLog(" primaryKeyColumn ",primaryKeyColumn)
    if (!primaryKeyColumn) {
        console.error("未找到主键列，请检查 tableStruct 数据结构");
        return '';
    }
    var keyColumn = 0;
    params.columns.forEach((item,index)=>{
        if(item === primaryKeyColumn[0]){
            keyColumn = index
        }
    })

    debugLog(" params.values ",params.values)
    var whereArr = [];
    var cell = params.oldRow[keyColumn]
    if (/int|bigint/.test(primaryKeyColumn[1])) {
        whereArr.push(Number(cell)); // 转换为数值类型
    } else {
        whereArr.push(cell);
    }
    debugLog(" whereArr ",whereArr)
 
    // 生成set 
    var setArr = []

    params.columns.forEach((paramsItem,index)=>{
        if(true){
            // paramsItem !== primaryKeyColumn[0]
            var cell = params.values[index]
            var columnType = params.tableStruct.find((item) => item[0] === paramsItem)[1];
            if (/int|bigint|bit/.test(columnType)) {
                debugLog(" ## cell ",cell)
                var newValue = cell === '' || cell === null ? 0 : cell
                if (isNaN(Number(newValue))) {
                    newValue = 0;
                }
                cell = Number(newValue)
            } else {
                cell =`'${cell.replace(/'/g, "\\'")}'`;
            }
            
            setArr.push(paramsItem+' = '+cell)    
        }
    })

    return `UPDATE \``+params.database+'\`.\`'+params.tableName+`\` SET ${setArr.join(', ')} WHERE ${primaryKeyColumn[0]} = ${whereArr};`
}
 

function getYYYYMMDDHHmmss() {
    const now = new Date();
    const year = now.getFullYear();
    const month = ('0' + (now.getMonth() + 1)).slice(-2); // 月份从0开始，所以加1
    const day = ('0' + now.getDate()).slice(-2);
    const hours = ('0' + now.getHours()).slice(-2);
    const minutes = ('0' + now.getMinutes()).slice(-2);
    const seconds = ('0' + now.getSeconds()).slice(-2);

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

 
// 复制表
export const copyTable = (params) =>{
    const datetime = getYYYYMMDDHHmmss()
    return `CREATE TABLE \``+params.database+'\`.\`'+params.tableName+`_copy_`+datetime+`\` LIKE \``+params.database+'\`.\`'+params.tableName+`\`;`
}

// 导出表
export const exportTable = (tableName) =>{
    return `SELECT * INTO OUTFILE '${tableName}.csv' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' FROM ${tableName};`
}

// 导入表
export const importTable = (tableName) =>{
    return `LOAD DATA INFILE '${tableName}.csv' INTO TABLE ${tableName} FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';`
}


export const loadSqlFile = (dbName,path) =>{
    return  `USE database_name; source /path/to/your/file.sql;`
}
 

 
export default {
    createTable,
    dropTable,
    exportTable,
    importTable,
    // ... 可以添加更多工具函数
};

