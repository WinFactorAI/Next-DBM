
export const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "AND",
    "OR",
    "IN",
    "LIKE",
    "NOT",
    "NULL",
    "IS",
    "BETWEEN",
    "CASE",
    "CREATE",
    "DATABASE",
    "DATABASES",
    "DELETE",
    "DESCRIBE",
    "DESC",
    "DISTINCT",
    "DROP",
    "DUPLICATE",
    "ELSE",
    "EXISTS",
    "EXPLAIN",
    "FOR",
    "GROUP",
    "HAVING",
    "IF",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "ORDER",
    "BY",
    "ASC",
    "LIMIT",
    "ALTER",
    "ALTER TABLE",
    "ALTER TABLESPACE",
    "ALTER USER",
    "ANALYZE TABLE",
    "BEGIN",
    "BETWEEN",
    "BIGINT",
    "BINARY",
    "BIT",
    "BLOB",
    "BOOL",
    "BOOLEAN",
    "BREAK",
    "BROWSE",
]

export const whereKeywords=[
    "AND",
    "OR",
    "IN",
    "LIKE",
    "NOT",
    "NULL",
    "IS",
    "BETWEEN",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "LIMIT",
    "ALTER",
    "ALTERTABLE",
]

export const orderByKeywords=[
    "ORDER",
    "BY",
    "ASC",
    "DESC",
]
// mysql 字符集
const Charsets = [
        {
            "charset": "big5",
            "collations": [
                "big5_chinese_ci",
                "big5_bin"
            ]
        },
        {
            "charset": "dec8",
            "collations": [
                "dec8_swedish_ci",
                "dec8_bin"
            ]
        },
        {
            "charset": "cp850",
            "collations": [
                "cp850_general_ci",
                "cp850_bin"
            ]
        },
        {
            "charset": "hp8",
            "collations": [
                "hp8_english_ci",
                "hp8_bin"
            ]
        },
        {
            "charset": "koi8r",
            "collations": [
                "koi8r_general_ci",
                "koi8r_bin"
            ]
        },
        {
            "charset": "latin1",
            "collations": [
                "latin1_german1_ci",
                "latin1_swedish_ci",
                "latin1_danish_ci",
                "latin1_german2_ci",
                "latin1_bin",
                "latin1_general_ci",
                "latin1_general_cs",
                "latin1_spanish_ci"
            ]
        },
        {
            "charset": "latin2",
            "collations": [
                "latin2_czech_cs",
                "latin2_general_ci",
                "latin2_hungarian_ci",
                "latin2_croatian_ci",
                "latin2_bin"
            ]
        },
        {
            "charset": "swe7",
            "collations": [
                "swe7_swedish_ci",
                "swe7_bin"
            ]
        },
        {
            "charset": "ascii",
            "collations": [
                "ascii_general_ci",
                "ascii_bin"
            ]
        },
        {
            "charset": "ujis",
            "collations": [
                "ujis_japanese_ci",
                "ujis_bin"
            ]
        },
        {
            "charset": "sjis",
            "collations": [
                "sjis_japanese_ci",
                "sjis_bin"
            ]
        },
        {
            "charset": "hebrew",
            "collations": [
                "hebrew_general_ci",
                "hebrew_bin"
            ]
        },
        {
            "charset": "tis620",
            "collations": [
                "tis620_thai_ci",
                "tis620_bin"
            ]
        },
        {
            "charset": "euckr",
            "collations": [
                "euckr_korean_ci",
                "euckr_bin"
            ]
        },
        {
            "charset": "koi8u",
            "collations": [
                "koi8u_general_ci",
                "koi8u_bin"
            ]
        },
        {
            "charset": "gb2312",
            "collations": [
                "gb2312_chinese_ci",
                "gb2312_bin"
            ]
        },
        {
            "charset": "greek",
            "collations": [
                "greek_general_ci",
                "greek_bin"
            ]
        },
        {
            "charset": "cp1250",
            "collations": [
                "cp1250_general_ci",
                "cp1250_czech_cs",
                "cp1250_croatian_ci",
                "cp1250_bin",
                "cp1250_polish_ci"
            ]
        },
        {
            "charset": "gbk",
            "collations": [
                "gbk_chinese_ci",
                "gbk_bin"
            ]
        },
        {
            "charset": "latin5",
            "collations": [
                "latin5_turkish_ci",
                "latin5_bin"
            ]
        },
        {
            "charset": "armscii8",
            "collations": [
                "armscii8_general_ci",
                "armscii8_bin"
            ]
        },
        {
            "charset": "utf8mb3",
            "collations": [
                "utf8mb3_general_ci",
                "utf8mb3_tolower_ci",
                "utf8mb3_bin",
                "utf8mb3_unicode_ci",
                "utf8mb3_icelandic_ci",
                "utf8mb3_latvian_ci",
                "utf8mb3_romanian_ci",
                "utf8mb3_slovenian_ci",
                "utf8mb3_polish_ci",
                "utf8mb3_estonian_ci",
                "utf8mb3_spanish_ci",
                "utf8mb3_swedish_ci",
                "utf8mb3_turkish_ci",
                "utf8mb3_czech_ci",
                "utf8mb3_danish_ci",
                "utf8mb3_lithuanian_ci",
                "utf8mb3_slovak_ci",
                "utf8mb3_spanish2_ci",
                "utf8mb3_roman_ci",
                "utf8mb3_persian_ci",
                "utf8mb3_esperanto_ci",
                "utf8mb3_hungarian_ci",
                "utf8mb3_sinhala_ci",
                "utf8mb3_german2_ci",
                "utf8mb3_croatian_ci",
                "utf8mb3_unicode_520_ci",
                "utf8mb3_vietnamese_ci",
                "utf8mb3_general_mysql500_ci"
            ]
        },
        {
            "charset": "ucs2",
            "collations": [
                "ucs2_general_ci",
                "ucs2_bin",
                "ucs2_unicode_ci",
                "ucs2_icelandic_ci",
                "ucs2_latvian_ci",
                "ucs2_romanian_ci",
                "ucs2_slovenian_ci",
                "ucs2_polish_ci",
                "ucs2_estonian_ci",
                "ucs2_spanish_ci",
                "ucs2_swedish_ci",
                "ucs2_turkish_ci",
                "ucs2_czech_ci",
                "ucs2_danish_ci",
                "ucs2_lithuanian_ci",
                "ucs2_slovak_ci",
                "ucs2_spanish2_ci",
                "ucs2_roman_ci",
                "ucs2_persian_ci",
                "ucs2_esperanto_ci",
                "ucs2_hungarian_ci",
                "ucs2_sinhala_ci",
                "ucs2_german2_ci",
                "ucs2_croatian_ci",
                "ucs2_unicode_520_ci",
                "ucs2_vietnamese_ci",
                "ucs2_general_mysql500_ci"
            ]
        },
        {
            "charset": "cp866",
            "collations": [
                "cp866_general_ci",
                "cp866_bin"
            ]
        },
        {
            "charset": "keybcs2",
            "collations": [
                "keybcs2_general_ci",
                "keybcs2_bin"
            ]
        },
        {
            "charset": "macce",
            "collations": [
                "macce_general_ci",
                "macce_bin"
            ]
        },
        {
            "charset": "macroman",
            "collations": [
                "macroman_general_ci",
                "macroman_bin"
            ]
        },
        {
            "charset": "cp852",
            "collations": [
                "cp852_general_ci",
                "cp852_bin"
            ]
        },
        {
            "charset": "latin7",
            "collations": [
                "latin7_estonian_cs",
                "latin7_general_ci",
                "latin7_general_cs",
                "latin7_bin"
            ]
        },
        {
            "charset": "cp1251",
            "collations": [
                "cp1251_bulgarian_ci",
                "cp1251_ukrainian_ci",
                "cp1251_bin",
                "cp1251_general_ci",
                "cp1251_general_cs"
            ]
        },
        {
            "charset": "utf16",
            "collations": [
                "utf16_general_ci",
                "utf16_bin",
                "utf16_unicode_ci",
                "utf16_icelandic_ci",
                "utf16_latvian_ci",
                "utf16_romanian_ci",
                "utf16_slovenian_ci",
                "utf16_polish_ci",
                "utf16_estonian_ci",
                "utf16_spanish_ci",
                "utf16_swedish_ci",
                "utf16_turkish_ci",
                "utf16_czech_ci",
                "utf16_danish_ci",
                "utf16_lithuanian_ci",
                "utf16_slovak_ci",
                "utf16_spanish2_ci",
                "utf16_roman_ci",
                "utf16_persian_ci",
                "utf16_esperanto_ci",
                "utf16_hungarian_ci",
                "utf16_sinhala_ci",
                "utf16_german2_ci",
                "utf16_croatian_ci",
                "utf16_unicode_520_ci",
                "utf16_vietnamese_ci"
            ]
        },
        {
            "charset": "utf16le",
            "collations": [
                "utf16le_general_ci",
                "utf16le_bin"
            ]
        },
        {
            "charset": "cp1256",
            "collations": [
                "cp1256_general_ci",
                "cp1256_bin"
            ]
        },
        {
            "charset": "cp1257",
            "collations": [
                "cp1257_lithuanian_ci",
                "cp1257_bin",
                "cp1257_general_ci"
            ]
        },
        {
            "charset": "utf32",
            "collations": [
                "utf32_general_ci",
                "utf32_bin",
                "utf32_unicode_ci",
                "utf32_icelandic_ci",
                "utf32_latvian_ci",
                "utf32_romanian_ci",
                "utf32_slovenian_ci",
                "utf32_polish_ci",
                "utf32_estonian_ci",
                "utf32_spanish_ci",
                "utf32_swedish_ci",
                "utf32_turkish_ci",
                "utf32_czech_ci",
                "utf32_danish_ci",
                "utf32_lithuanian_ci",
                "utf32_slovak_ci",
                "utf32_spanish2_ci",
                "utf32_roman_ci",
                "utf32_persian_ci",
                "utf32_esperanto_ci",
                "utf32_hungarian_ci",
                "utf32_sinhala_ci",
                "utf32_german2_ci",
                "utf32_croatian_ci",
                "utf32_unicode_520_ci",
                "utf32_vietnamese_ci"
            ]
        },
        {
            "charset": "binary",
            "collations": [
                "binary"
            ]
        },
        {
            "charset": "geostd8",
            "collations": [
                "geostd8_general_ci",
                "geostd8_bin"
            ]
        },
        {
            "charset": "cp932",
            "collations": [
                "cp932_japanese_ci",
                "cp932_bin"
            ]
        },
        {
            "charset": "eucjpms",
            "collations": [
                "eucjpms_japanese_ci",
                "eucjpms_bin"
            ]
        },
        {
            "charset": "gb18030",
            "collations": [
                "gb18030_chinese_ci",
                "gb18030_bin",
                "gb18030_unicode_520_ci"
            ]
        },
        {
            "charset": "utf8mb4",
            "collations": [
                "utf8mb4_general_ci",
                "utf8mb4_bin",
                "utf8mb4_unicode_ci",
                "utf8mb4_icelandic_ci",
                "utf8mb4_latvian_ci",
                "utf8mb4_romanian_ci",
                "utf8mb4_slovenian_ci",
                "utf8mb4_polish_ci",
                "utf8mb4_estonian_ci",
                "utf8mb4_spanish_ci",
                "utf8mb4_swedish_ci",
                "utf8mb4_turkish_ci",
                "utf8mb4_czech_ci",
                "utf8mb4_danish_ci",
                "utf8mb4_lithuanian_ci",
                "utf8mb4_slovak_ci",
                "utf8mb4_spanish2_ci",
                "utf8mb4_roman_ci",
                "utf8mb4_persian_ci",
                "utf8mb4_esperanto_ci",
                "utf8mb4_hungarian_ci",
                "utf8mb4_sinhala_ci",
                "utf8mb4_german2_ci",
                "utf8mb4_croatian_ci",
                "utf8mb4_unicode_520_ci",
                "utf8mb4_vietnamese_ci",
                "utf8mb4_0900_ai_ci",
                "utf8mb4_de_pb_0900_ai_ci",
                "utf8mb4_is_0900_ai_ci",
                "utf8mb4_lv_0900_ai_ci",
                "utf8mb4_ro_0900_ai_ci",
                "utf8mb4_sl_0900_ai_ci",
                "utf8mb4_pl_0900_ai_ci",
                "utf8mb4_et_0900_ai_ci",
                "utf8mb4_es_0900_ai_ci",
                "utf8mb4_sv_0900_ai_ci",
                "utf8mb4_tr_0900_ai_ci",
                "utf8mb4_cs_0900_ai_ci",
                "utf8mb4_da_0900_ai_ci",
                "utf8mb4_lt_0900_ai_ci",
                "utf8mb4_sk_0900_ai_ci",
                "utf8mb4_es_trad_0900_ai_ci",
                "utf8mb4_la_0900_ai_ci",
                "utf8mb4_eo_0900_ai_ci",
                "utf8mb4_hu_0900_ai_ci",
                "utf8mb4_hr_0900_ai_ci",
                "utf8mb4_vi_0900_ai_ci",
                "utf8mb4_0900_as_cs",
                "utf8mb4_de_pb_0900_as_cs",
                "utf8mb4_is_0900_as_cs",
                "utf8mb4_lv_0900_as_cs",
                "utf8mb4_ro_0900_as_cs",
                "utf8mb4_sl_0900_as_cs",
                "utf8mb4_pl_0900_as_cs",
                "utf8mb4_et_0900_as_cs",
                "utf8mb4_es_0900_as_cs",
                "utf8mb4_sv_0900_as_cs",
                "utf8mb4_tr_0900_as_cs",
                "utf8mb4_cs_0900_as_cs",
                "utf8mb4_da_0900_as_cs",
                "utf8mb4_lt_0900_as_cs",
                "utf8mb4_sk_0900_as_cs",
                "utf8mb4_es_trad_0900_as_cs",
                "utf8mb4_la_0900_as_cs",
                "utf8mb4_eo_0900_as_cs",
                "utf8mb4_hu_0900_as_cs",
                "utf8mb4_hr_0900_as_cs",
                "utf8mb4_vi_0900_as_cs",
                "utf8mb4_ja_0900_as_cs",
                "utf8mb4_ja_0900_as_cs_ks",
                "utf8mb4_0900_as_ci",
                "utf8mb4_ru_0900_ai_ci",
                "utf8mb4_ru_0900_as_cs",
                "utf8mb4_zh_0900_as_cs",
                "utf8mb4_0900_bin",
                "utf8mb4_nb_0900_ai_ci",
                "utf8mb4_nb_0900_as_cs",
                "utf8mb4_nn_0900_ai_ci",
                "utf8mb4_nn_0900_as_cs",
                "utf8mb4_sr_latn_0900_ai_ci",
                "utf8mb4_sr_latn_0900_as_cs",
                "utf8mb4_bs_0900_ai_ci",
                "utf8mb4_bs_0900_as_cs",
                "utf8mb4_bg_0900_ai_ci",
                "utf8mb4_bg_0900_as_cs",
                "utf8mb4_gl_0900_ai_ci",
                "utf8mb4_gl_0900_as_cs",
                "utf8mb4_mn_cyrl_0900_ai_ci",
                "utf8mb4_mn_cyrl_0900_as_cs"
            ]
        }
    ]
 

/* 写一个方法获取 所有的 charset  */
export const getCharsets = () => {
    return Charsets.map(item => item.charset)
}

export const getCollations = (charset) => {
    // debugLog(" charset ",charset);   
    const charsetInfo = Charsets.find(item => item.charset === charset);
    // debugLog(" charsetInfo ",charsetInfo);
    return charsetInfo ? charsetInfo.collations : null; // 如果找到，返回collations数组，否则返回null
}

export const IndexPanelAttr = [
    { 
        distType:'keyBlockSize',
        type: 'number',
        label:'键块大小',
        placeholder:'请输入键块大小',
        rules:[]
    },
    {
        distType:'btreeWithParser',
        type: 'text',
        label:'解析器',
        placeholder:'请输入解析器',
        rules:[]
    },
]


export const algorithm=[
    {
        value: '',
        label: ''
    },
    {
        value: 'UNDEFINED',
        label: 'UNDEFINED'
    },
    {
        value: 'MERGE',
        label: 'MERGE'
    },
    {
        value: 'TEMPTABLE',
        label: 'TEMPTABLE'
    }
]

export const sqlSecurity=[
    {
        value: '',
        label: ''
    },
    {
        value: 'DEFINER',
        label: 'DEFINER'
    },
    {
        value: 'INVOKER',
        label: 'INVOKER'
    }
]
export const checkOptions =[
    {
        value: '',
        label: ''
    },
    {
        value: 'CASCADED',
        label: 'CASCADED'
    },
    {
        value: 'LOCAL',
        label: 'LOCAL'
    }
]
export const ViewPanelAttr = [
    { 
        distType:'algorithm',
        type: 'select',
        label:'算法',
        placeholder:'请选择算法',
        rules:[]
    },
    {
        distType:'legislator',
        type: 'text',
        label:'定义者',
        placeholder:'请输入定义者',
        rules:[]
    },
    { 
        distType:'sqlSecurity',
        type: 'select',
        label:'SQL安全性',
        placeholder:'请输选择SQL安全性',
        rules:[]
    },
    {
        distType:'checkOptions',
        type: 'select',
        label:'检查选项',
        placeholder:'请选择检查选项',
        rules:[]
    },
]

// 字段是否
export const DistYesNo = [
    {
        value: 'Y',
        label: '是'
    },
    {
        value: 'N',
        label: '否'
    }
]

// 字段类型
export const ColumnsType = [
    {
        value: '',
        label: '',
    },
    // 整数类型
    {
        value: 'bigint',
        label: 'bigint',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'AutomaticIncrement',
                type: 'checkbox',
                label:'自动递增',
                placeholder:'请选择是否自动递增',
                rules:[]
            },
            {  
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'binary',
        label: 'binary',
        attrs: [{ 
            distType:'DefaultValue',
            type: 'select',
            label:'默认值',
            placeholder:'请选择默认值',
            rules:[]
        },]

    },

    {
        value: 'tinyint',
        label: 'tinyint',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'AutomaticIncrement',
                type: 'checkbox',
                label:'自动递增',
                placeholder:'请选择是否自动递增',
                rules:[]
            },
            {  
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'smallint',
        label: 'smallint',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'AutomaticIncrement',
                type: 'checkbox',
                label:'自动递增',
                placeholder:'请选择是否自动递增',
                rules:[]
            },
            {  
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'mediumint',
        label: 'mediumint',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'AutomaticIncrement',
                type: 'checkbox',
                label:'自动递增',
                placeholder:'请选择是否自动递增',
                rules:[]
            },
            {  
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'int',
        label: 'int',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'AutomaticIncrement',
                type: 'checkbox',
                label:'自动递增',
                placeholder:'请选择是否自动递增',
                rules:[]
            },
            {  
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'integer',
        label: 'integer',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'AutomaticIncrement',
                type: 'checkbox',
                label:'自动递增',
                placeholder:'请选择是否自动递增',
                rules:[]
            },
            {  
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },


    // 浮点数类型
    {
        value: 'float',
        label: 'float',
        attrs: [
             { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'AutomaticIncrement',
                type: 'checkbox',
                label:'自动递增',
                placeholder:'请选择是否自动递增',
                rules:[]
            },
            {  
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'double',
        label: 'double',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'AutomaticIncrement',
                type: 'checkbox',
                label:'自动递增',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'decimal',
        label: 'decimal',
        length: 10,
        precision: 2,
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },

    // 字符串类型
    {
        value: 'char',
        label: 'char',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'字符集',
                placeholder:'请选择字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets', 
                distType:'Collations',
                type: 'select',
                label:'排序规则',
                placeholder:'请选择排序规则',
                rules:[]
            },
            { 
                distType:'Binary',
                type: 'checkbox',
                label:'二进制',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'varchar',
        label: 'varchar',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'字符集',
                placeholder:'请选择字符集',
                rules:[]
            },
            {  
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'排序规则',
                placeholder:'请选择排序规则',
                rules:[]
            },
            { 
                distType:'Binary',
                type: 'checkbox',
                label:'二进制',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'tinytext',
        label: 'tinytext',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'字符集',
                placeholder:'请选择字符集',
                rules:[]
            },
            {  
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'排序规则',
                placeholder:'请选择排序规则',
                rules:[]
            },
        ]
    },
    {
        value: 'text',
        label: 'text',
        attrs: [
            { 
                distType:'Charsets',
                type: 'select',
                label:'字符集',
                placeholder:'请选择字符集',
                rules:[]
            },
            {  
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'排序规则',
                placeholder:'请选择排序规则',
                rules:[]
            },
            { 
                distType:'Binary',
                type: 'checkbox',
                label:'二进制',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'mediumtext',
        label: 'mediumtext',
        attrs: [
            { 
                distType:'Charsets',
                type: 'select',
                label:'字符集',
                placeholder:'请选择字符集',
                rules:[]
            },
            {  
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'排序规则',
                placeholder:'请选择排序规则',
                rules:[]
            },
            { 
                distType:'Binary',
                type: 'checkbox',
                label:'二进制',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'longtext',
        label: 'longtext',
        attrs: [
            { 
                distType:'Charsets',
                type: 'select',
                label:'字符集',
                placeholder:'请选择字符集',
                rules:[]
            },
            {  
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'排序规则',
                placeholder:'请选择排序规则',
                rules:[]
            },
            { 
                distType:'Binary',
                type: 'checkbox',
                label:'二进制',
                placeholder:'请选择XXX',
                rules:[]
            },

        ]
    },
    {
        value: 'tinyblob',
        label: 'tinyblob',
        attrs: []
    },
    {
        value: 'blob',
        label: 'blob',
        attrs: []
    },
    {
        value: 'mediumblob',
        label: 'medium Blob',
        attrs: []
    },
    {
        value: 'longblob',
        label: 'long Blob',
        attrs: []
    },
    {
        value: 'enum',
        label: 'enum',
        attrs: [
            { 
                distType:'Enum',
                type: 'selectAdd',
                label:'枚举值',
                placeholder:'请选择枚举值',
                rules:[]
            },,
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'字符集',
                placeholder:'请选择字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'排序规则',
                placeholder:'请选择排序规则',
                rules:[]
            },
        ]
    },
    {
        value: 'set',
        label: 'set',
        attrs: [
            { 
                distType:'Enum',
                type: 'selectAdd',
                label:'枚举值',
                placeholder:'请选择枚举值',
                rules:[]
            },,
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'字符集',
                placeholder:'请选择字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'排序规则',
                placeholder:'请选择排序规则',
                rules:[]
            },
        ]
    },

    // 日期和时间类型
    {
        value: 'date',
        label: 'date',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
        ]
    },
    {
        value: 'datetime',
        label: 'datetime',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'OnUpdate',
                type: 'checkbox',
                label:'根据时间戳更新',
                placeholder:'请选择是否自动递增',
                rules:[]
            }
        ]
    },
    {
        value: 'timestamp',
        label: 'timestamp',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'OnUpdate',
                type: 'checkbox',
                label:'根据时间戳更新',
                placeholder:'请选择是否自动递增',
                rules:[]
            }
        ]
    },
    {
        value: 'time',
        label: 'time',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
        ]
    },
    {
        value: 'year',
        label: 'year',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
        ]
    },

    // 其他类型
    {
        value: 'bit',
        label: 'bit',
        attrs: [ 
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
        ]
    },
    {
        value: 'varbinary',
        label: 'varbinary',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
        ]
    },
    {
        value: 'json',
        label: 'json',
        attrs: []
    },
    {
        value: 'linestring',
        label: 'linestring',
        attrs: []   
    },

    {
        value: 'geometry',
        label: 'geometry',
        attrs: []      
    },
    {
        value: 'geometrycollection',
        label: 'geometrycollection',
        attrs: []   
    },
    {
        value: 'multilinestring',
        label: 'multilinestring',
        attrs: []   
    },
    {
        value: 'multipoint',
        label: 'multipoint',
        attrs: []   
    },
    {
        value: 'multipolygon',
        label: 'multipolygon',
        attrs: []   
    },
    {
        value: 'numeric',
        label: 'numeric',
        attrs: [
            { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择XXX',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'填充零',
                placeholder:'请选择XXX',
                rules:[]
            },
        ]
    },
    {
        value: 'polygon',
        label: 'polygon',
        attrs: []   
    },
    {
        value: 'real',
        label: 'real',
        attrs: [
             { 
                distType:'DefaultValue',
                type: 'select',
                label:'默认值',
                placeholder:'请选择默认值',
                rules:[]
            },
            { 
                distType:'Unsigned',
                type: 'checkbox',
                label:'无符号',
                placeholder:'请选择是否无符号',
                rules:[]
            },
            { 
                distType:'ZeroFill',
                type: 'checkbox',
                label:'零填充',
                placeholder:'请选择是否零填充',
                rules:[]
            },
        ]
    },
];

// 通过value 查询节点信息
export const getColumnsType = (value) => {
    return ColumnsType.find(item => item.value === value);
}

// 字段-默认值
export const DefaultValue = [
    {
        value: '',
        label: ''
    },
    {
        value: 'EMPTY STRING',
        label: 'EMPTY STRING'
    },
    {
        value: 'NULL',
        label: 'NULL'
    },
]

// 选项-引擎
export const Engines =[
    {
        value: 'ARCHIVE',
        label: 'ARCHIVE',
        attrs: [
            { 
                distType:'TableSpace',
                type: 'select',
                label:'表空间',
                placeholder:'请选择表空间',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'默认字符集',
                placeholder:'请选择默认字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'默认排序规则',
                placeholder:'请选择默默认排序规则',
                rules:[]
            },
            { 
                distType:'avageRowLen',
                type: 'number',
                label:'平均行长度',
                placeholder:'请输入平均行长度',
                rules:[]
            },
            { 
                distType:'minRowCount',
                type: 'number',
                label:'最小行数',
                placeholder:'请输入最小行数',
                rules:[]
            },
            { 
                distType:'maxRowCount',
                type: 'number',
                label:'最大行数',
                placeholder:'请输入最大行数',
                rules:[]
            },
            { 
                distType:'packKeysSize',
                type: 'number',
                label:'键块大小',
                placeholder:'请输入键块大小',
                rules:[]
            },
            { 
                distType:'RowFormat',
                type: 'select',
                label:'行格式',
                placeholder:'请选择行格式',
                rules:[]
            },
        ]

    },
    {
        value: 'BLACKHOLE',
        label: 'BLACKHOLE',
        attrs: [
            { 
                distType:'TableSpace',
                type: 'select',
                label:'表空间',
                placeholder:'请选择表空间',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'默认字符集',
                placeholder:'请选择默认字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'默认排序规则',
                placeholder:'请选择默默认排序规则',
                rules:[]
            },
            { 
                distType:'avageRowLen',
                type: 'number',
                label:'平均行长度',
                placeholder:'请输入平均行长度',
                rules:[]
            },
            { 
                distType:'minRowCount',
                type: 'number',
                label:'最小行数',
                placeholder:'请输入最小行数',
                rules:[]
            },
            { 
                distType:'maxRowCount',
                type: 'number',
                label:'最大行数',
                placeholder:'请输入最大行数',
                rules:[]
            },
            { 
                distType:'packKeysSize',
                type: 'number',
                label:'键块大小',
                placeholder:'请输入键块大小',
                rules:[]
            },
            { 
                distType:'RowFormat',
                type: 'select',
                label:'行格式',
                placeholder:'请选择行格式',
                rules:[]
            },
        ]
    },
    {
        value: 'CSV',
        label: 'CSV',
        attrs: [
            { 
                distType:'TableSpace',
                type: 'select',
                label:'表空间',
                placeholder:'请选择表空间',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'默认字符集',
                placeholder:'请选择默认字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'默认排序规则',
                placeholder:'请选择默默认排序规则',
                rules:[]
            },
            { 
                distType:'avageRowLen',
                type: 'number',
                label:'平均行长度',
                placeholder:'请输入平均行长度',
                rules:[]
            },
            { 
                distType:'minRowCount',
                type: 'number',
                label:'最小行数',
                placeholder:'请输入最小行数',
                rules:[]
            },
            { 
                distType:'maxRowCount',
                type: 'number',
                label:'最大行数',
                placeholder:'请输入最大行数',
                rules:[]
            },
            { 
                distType:'packKeysSize',
                type: 'number',
                label:'键块大小',
                placeholder:'请输入键块大小',
                rules:[]
            },
            { 
                distType:'RowFormat',
                type: 'select',
                label:'行格式',
                placeholder:'请选择行格式',
                rules:[]
            },
        ]
    },
    {
        value: 'InnoDB',
        label: 'InnoDB',
        attrs: [
            { 
                distType:'TableSpace',
                type: 'select',
                label:'表空间',
                placeholder:'请选择表空间',
                rules:[]
            },
            { 
                distType:'auto',
                type: 'number',
                label:'自动递增',
                placeholder:'请输入自动递增',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'默认字符集',
                placeholder:'请选择默认字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'默认排序规则',
                placeholder:'请选择默认排序规则',
                rules:[]
            },
            { 
                distType:'dataDir',
                type: 'text',
                label:'数据目录',
                placeholder:'请输入数据目录',
                rules:[]
            },
            { 
                distType:'indexDir',
                type: 'text',
                label:'索引目录',
                placeholder:'请输入索引目录',
                rules:[]
            },


            { 
                distType:'avageRowLen',
                type: 'number',
                label:'平均行长度',
                placeholder:'请输入平均行长度',
                rules:[]
            },
            { 
                distType:'minRowCount',
                type: 'number',
                label:'最小行数',
                placeholder:'请输入最小行数',
                rules:[]
            },
            { 
                distType:'maxRowCount',
                type: 'number',
                label:'最大行数',
                placeholder:'请输入最大行数',
                rules:[]
            },
            { 
                distType:'keyBlockSize',
                type: 'number',
                label:'键块大小',
                placeholder:'请输入键块大小',
                rules:[]
            },
            { 
                distType:'RowFormat',
                type: 'select',
                label:'行格式',
                placeholder:'请选择行格式',
                rules:[]
            },
            { 
                distType:'statsAuotRecalc',
                type: 'select',
                label:'统计数据自动重计',
                placeholder:'请输入统计数据自动重计',
                rules:[]
            },
            { 
                distType:'statsPersistent',
                type: 'select',
                label:'统计数据持久',
                placeholder:'请输入统计数据持久',
                rules:[]
            },
            { 
                distType:'indexDir',
                type: 'number',
                label:'统计样本页面',
                placeholder:'请输入统计样本页面',
                rules:[]
            },
            { 
                distType:'encryption',
                type: 'checkbox',
                label:'加密',
                placeholder:'请输入加密',
                rules:[]
            },
        ]
    },
    {
        value: 'MEMORY',
        label: 'MEMORY',
        attrs: [
            { 
                distType:'TableSpace',
                type: 'select',
                label:'表空间',
                placeholder:'请选择表空间',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'默认字符集',
                placeholder:'请选择默认字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'默认排序规则',
                placeholder:'请选择默默认排序规则',
                rules:[]
            },
            { 
                distType:'avageRowLen',
                type: 'number',
                label:'平均行长度',
                placeholder:'请输入平均行长度',
                rules:[]
            },
            { 
                distType:'minRowCount',
                type: 'number',
                label:'最小行数',
                placeholder:'请输入最小行数',
                rules:[]
            },
            { 
                distType:'maxRowCount',
                type: 'number',
                label:'最大行数',
                placeholder:'请输入最大行数',
                rules:[]
            },
            { 
                distType:'packKeysSize',
                type: 'number',
                label:'键块大小',
                placeholder:'请输入键块大小',
                rules:[]
            },
            { 
                distType:'RowFormat',
                type: 'select',
                label:'行格式',
                placeholder:'请选择行格式',
                rules:[]
            },
        ]
    },
    {
        value: 'MRG_MYISAM',
        label: 'MRG_MYISAM',
        attrs: [
            { 
                distType:'TableSpace',
                type: 'select',
                label:'表空间',
                placeholder:'请选择表空间',
                rules:[]
            },
            { 
                distType:'unionTable',
                type: 'text',
                label:'并集表',
                placeholder:'请输入并集表',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'默认字符集',
                placeholder:'请选择默认字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'默认排序规则',
                placeholder:'请选择默默认排序规则',
                rules:[]
            },
            { 
                distType:'avageRowLen',
                type: 'number',
                label:'平均行长度',
                placeholder:'请输入平均行长度',
                rules:[]
            },
            { 
                distType:'minRowCount',
                type: 'number',
                label:'最小行数',
                placeholder:'请输入最小行数',
                rules:[]
            },
            { 
                distType:'maxRowCount',
                type: 'number',
                label:'最大行数',
                placeholder:'请输入最大行数',
                rules:[]
            },
            { 
                distType:'packKeysSize',
                type: 'number',
                label:'键块大小',
                placeholder:'请输入键块大小',
                rules:[]
            },
            { 
                distType:'RowFormat',
                type: 'select',
                label:'行格式',
                placeholder:'请选择行格式',
                rules:[]
            },
        ]
    },
    {
        value: 'MyISAM',
        label: 'MyISAM',
        attrs: [
            { 
                distType:'TableSpace',
                type: 'select',
                label:'表空间',
                placeholder:'请选择表空间',
                rules:[]
            },
            { 
                distType:'auto',
                type: 'number',
                label:'自动递增',
                placeholder:'请输入自动递增',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'默认字符集',
                placeholder:'请选择默认字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'默认排序规则',
                placeholder:'请选择默默认排序规则',
                rules:[]
            },
            { 
                distType:'dataDir',
                type: 'text',
                label:'数据目录',
                placeholder:'请输入数据目录',
                rules:[]
            },
            { 
                distType:'indexDir',
                type: 'text',
                label:'索引目录',
                placeholder:'请输入索引目录',
                rules:[]
            },
            { 
                distType:'avageRowLen',
                type: 'number',
                label:'平均行长度',
                placeholder:'请输入平均行长度',
                rules:[]
            },
            { 
                distType:'minRowCount',
                type: 'number',
                label:'最小行数',
                placeholder:'请输入最小行数',
                rules:[]
            },
            { 
                distType:'maxRowCount',
                type: 'number',
                label:'最大行数',
                placeholder:'请输入最大行数',
                rules:[]
            },
            { 
                distType:'packKeysSize',
                type: 'number',
                label:'键块大小',
                placeholder:'请输入键块大小',
                rules:[]
            },
            { 
                distType:'RowFormat',
                type: 'select',
                label:'行格式',
                placeholder:'请选择行格式',
                rules:[]
            },
            { 
                distType:'packageKey',
                type: 'select',
                label:'封装键',
                placeholder:'请选择封装键',
                rules:[]
            },
            { 
                distType:'checksum',
                type: 'checkbox',
                label:'校验和',
                placeholder:'请选择校验和',
                rules:[]
            },
            { 
                distType:'delayedWrite',
                type: 'checkbox',
                label:'延迟键写入',
                placeholder:'请选择延迟键写入',
                rules:[]
            },
        ]
    },
    {
        value: 'PERFORMANCE_SCHEMA',
        label: 'PERFORMANCE_SCHEMA',
        attrs: [
            { 
                distType:'TableSpace',
                type: 'select',
                label:'表空间',
                placeholder:'请选择表空间',
                rules:[]
            },
            { 
                distType:'Charsets',
                type: 'select',
                label:'默认字符集',
                placeholder:'请选择默认字符集',
                rules:[]
            },
            { 
                levelDistType:'Charsets',
                distType:'Collations',
                type: 'select',
                label:'默认排序规则',
                placeholder:'请选择默默认排序规则',
                rules:[]
            },
            { 
                distType:'avageRowLen',
                type: 'number',
                label:'平均行长度',
                placeholder:'请输入平均行长度',
                rules:[]
            },
            { 
                distType:'minRowCount',
                type: 'number',
                label:'最小行数',
                placeholder:'请输入最小行数',
                rules:[]
            },
            { 
                distType:'maxRowCount',
                type: 'number',
                label:'最大行数',
                placeholder:'请输入最大行数',
                rules:[]
            },
            { 
                distType:'packKeysSize',
                type: 'number',
                label:'键块大小',
                placeholder:'请输入键块大小',
                rules:[]
            },
            { 
                distType:'RowFormat',
                type: 'select',
                label:'行格式',
                placeholder:'请选择行格式',
                rules:[]
            },
        ]

    },
]

// 表空间
export const TableSpace = [
    {
        value: 'innodb_file_per_table_1',
        label: 'innodb_file_per_table_1'
    },
    {
        value: 'innodb_file_per_table_2',
        label: 'innodb_file_per_table_2'
    },
    {
        value: 'innodb_file_per_table_3',
        label: 'innodb_file_per_table_3'
    },
    {
        value: '4000',
        label: '4000'
    },
    {
        value: '5000',
        label: '5000'
    },
    {
        value: '6000',
        label: '6000'
     },
     {
        value: '7000',
        label: '7000'
     },
     {
        value: '8000',
        label: '8000'
     },
     {
        value: '9000',
        label: '9000'
     },
     {
        value: '10000',
        label: '10000'
     }
];

export const RowFormat =[
    {
        value: '',
        label: ''
    },
    {
        value: 'Dynamic',
        label: 'Dynamic'
    },
    {
        value: 'COMPACT',
        label: 'COMPACT'
    },
    {
        value: 'COMPRESSED',
        label: 'COMPRESSED'
    },
    {
        value: 'DEFAULT',
        label: 'DEFAULT'
    },
    {
        value: 'DYNAMIC',
        label: 'DYNAMIC'
    },
    {
        value: 'FIXED',
        label: 'FIXED'
    },
    {
        value: 'REDUNDANT',
        label: 'REDUNDANT'
    },
    
]

export const DataOptions =[
    {
        value: '',
        label: ''
    },
    {
        value: '0',
        label: '0'
    },
    {
        value: '1',
        label: '1'
    },
    {
        value: 'DEFAULT',
        label: 'DEFAULT'
    },
]

export const IndexType = [
    {
        value: 'FULLTEXT',
        label: 'FULLTEXT'
    },
    {
        value: 'NORMAL',
        label: 'NORMAL'
    },
    {
        value: 'SPATIAL',
        label: 'SPATIAL'
    },
    {
        value: 'UNIQUE',
        label: 'UNIQUE'
    }
]
export const IndexFunction = [
    {
        value: 'BTREE',
        label: 'BTREE'
    },
    {
        value: 'HASH',
        label: 'HASH'
    }
]

export const ForeigenKeyAction = [
    {
        value: 'CASCADE',
        label: 'CASCADE'
    },
    {
        value: 'SET NULL',
        label: 'SET NULL'
    },
    {
        value: 'NO ACTION',
        label: 'NO ACTION'
    },
    {
        value: 'RESTRICT',
        label: 'RESTRICT'
    },
]

// 触发器时间类型
export const TriggerTimeType =[
    {
        value: 'BEFORE',
        label: 'BEFORE'
    },
    {
        value: 'AFTER',
        label: 'AFTER'
    },
    {
        value: 'ONCE',
        label: 'ONCE'
     }  
]

export const TriggerActionType =[
    {
        value: 'INSERT',
        label: 'INSERT'
    },
    {
        value: 'UPDATE',
        label: 'UPDATE'
    },
    {
        value: 'DELETE',
        label: 'DELETE'
     }
]