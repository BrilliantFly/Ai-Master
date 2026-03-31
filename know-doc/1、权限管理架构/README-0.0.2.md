权限管理架构
==============

当前最新版本： 0.0.2

### 核心功能模块
* 核心模块
  - 租户管理
  - 用户管理
  - 角色管理
  - 菜单/资源管理
  - 权限/资源管理
* 日志模块
  - 登录日志
  - 操作日志
  - 权限变更日志
  - 敏感操作审计日志
* 其他模块
  - 部门/组织管理
  - 岗位管理
  - 数据字典管理

---

### 一、数据库设计

#### 1.1 核心表结构

| 表名 | 说明 |
|------|------|
| sys_user | 用户表 |
| sys_role | 角色表 |
| sys_permission | 权限表 |
| sys_menu | 菜单表 |
| sys_user_role | 用户-角色关联表 |
| sys_role_permission | 角色-权限关联表 |
| sys_role_menu | 角色-菜单关联表 |
| sys_menu_permission | 菜单-权限关联表 |
| sys_dept | 部门/组织表 |
| sys_post | 岗位表 |
| sys_tenant | 租户表 |
| sys_data_permission | 数据权限配置表 |

#### 1.2 权限类型说明

| 权限类型 | 说明 | 实现方式 |
|----------|------|----------|
| 菜单权限 | 控制用户可访问的菜单 | sys_menu + sys_role_menu |
| 按钮权限 | 控制页面内按钮/操作的显示与操作权限 | sys_permission + 按钮标识 |
| 数据权限 | 控制用户可查看/操作的数据范围 | sys_data_permission 行级控制 |
| 租户权限 | 多租户场景下的数据隔离 | 租户ID字段 + SQL过滤 |

#### 1.3 按钮权限设计

```sql
-- 按钮权限标识存储示例
sys_permission 表增加字段：
- permission_type: 'button' | 'api' | 'data'
- permission_code: 唯一标识，如 'user:add'、'user:edit'、'user:delete'
- component_path: 关联的前端组件路径

-- 前端根据用户权限标识动态控制按钮显示
-- 后端在接口层校验按钮权限
```

---

### 二、认证流程（JWT）

#### 2.1 完整认证流程

```
用户登录 → 验证用户名密码 → 生成JWT Token → 返回给前端
                                      ↓
                              JWT包含信息：
                              - userId
                              - username
                              - tenantId
                              - roles[]
                              - permissions[]
                              - issuedAt
                              - expiration
```

#### 2.2 Token 配置

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| Access Token 有效期 | 2小时 | 短期令牌，频繁刷新 |
| Refresh Token 有效期 | 7天 | 长期令牌，用于续期 |
| Token 签名算法 | HS256/RSA | 推荐非对称加密 |
| Token 存储 | httpOnly Cookie | 防止 XSS 攻击 |

#### 2.3 Token 续期机制

```
前端存储 Refresh Token
        ↓
Access Token 过期（返回401）
        ↓
前端使用 Refresh Token 调用 /auth/refresh 接口
        ↓
验证 Refresh Token 有效性
        ↓
返回新的 Access Token + 新的 Refresh Token
```

#### 2.4 Token 吊销机制

| 方案 | 适用场景 | 实现方式 |
|------|----------|----------|
| 黑名单 | 用户主动登出/修改密码 | Redis 存储已吊销 Token |
| 白名单 | 会话管理严格 | 每次请求查询 Redis 有效 Token |
| 版本号 | 简单场景 | Token 包含版本号，修改密码时版本号+1 |

**建议实现：**
- 登录/修改密码时将原 Token 加入黑名单
- 黑名单存储在 Redis，过期时间 = Token 过期时间
- 关键操作（修改密码、禁用账户）触发 Token 吊销

---

### 三、动态权限控制

#### 3.1 权限存储结构

```java
// 路径-权限映射存储示例
SysUrlPermission {
    url: String,           // 访问路径，如 /api/user/**
    method: GET|POST|PUT|DELETE,
    requiredPermission: String,  // 所需权限标识
    requiredRole: String,         // 所需角色（可选）
    isAnonymous: Boolean,         // 是否匿名访问
}
```

#### 3.2 权限校验流程

```
请求进入 → JWT过滤器解析Token → 用户信息存入SecurityContext
        ↓
权限过滤器拦截 → 查询URL对应所需权限
        ↓
获取用户拥有权限 → 比对 → 放行/拒绝
```

#### 3.3 缓存策略

| 缓存内容 | 过期时间 | 失效触发 |
|----------|----------|----------|
| 用户权限列表 | 30分钟 | 权限变更、角色变更 |
| URL-权限映射 | 1小时 | 菜单/权限配置变更 |
| 角色-权限关系 | 30分钟 | 角色权限变更 |

**缓存更新机制：**
- 权限变更时通过事件机制主动清除缓存
- 使用 Redis 发布/订阅通知所有服务节点

---

### 四、安全防护机制

#### 4.1 密码安全

| 配置项 | 推荐值 |
|--------|--------|
| 加密算法 | BCrypt |
| 密码长度 | 最少8位 |
| 密码复杂度 | 大小写+数字+特殊字符 |
| 密码错误锁定 | 连续5次错误锁定15分钟 |
| 密码过期 | 90天强制修改 |

#### 4.2 登录保护

| 防护类型 | 实现方式 |
|----------|----------|
| 登录失败锁定 | 连续5次错误，锁定15分钟 |
| IP限制 | 可配置 IP 白名单/黑名单 |
| 验证码 | 登录失败3次后触发 |
| 异地登录提醒 | 检测登录 IP 变化 |

#### 4.3 接口安全

| 防护类型 | 说明 |
|----------|------|
| 请求限流 | 同一IP 100次/分钟 |
| 敏感接口二次验证 | 支付/修改密码需额外验证 |
| CSRF 防护 | Token 校验 |
| XSS 防护 | 输入过滤 + 输出编码 |

---

### 五、租户权限实现

#### 5.1 租户隔离方案

| 方案 | 适用场景 | 实现方式 |
|------|----------|----------|
| 字段隔离 | 数据量适中 | 所有业务表增加 tenant_id 字段 |
| 独立数据库 | 数据量大/隔离要求高 | 每个租户独立数据库 |
| 独立Schema | 多租户中大型 | 每个租户独立 Schema |

**推荐：字段隔离方案**

#### 5.2 租户配置表

```sql
sys_tenant {
    id: BigInt,
    tenant_name: String,
    tenant_code: String,    -- 唯一标识
    status: Boolean,       -- 启用/禁用
    max_users: Integer,    -- 最大用户数
    expire_date: Date,     -- 租户过期时间
    data_quota: BigInt,    -- 数据配额(MB)
}
```

#### 5.3 跨租户访问控制

- 超级管理员可配置跨租户访问权限
- 跨租户操作需记录审计日志
- 默认禁止跨租户数据访问

---

### 六、权限继承与委托

#### 6.1 角色层级（推荐实现）

```
超级管理员
    ↓ 继承
  系统管理员 → 部门管理员 → 普通用户
```

```sql
sys_role {
    id: BigInt,
    role_name: String,
    role_code: String,
    parent_id: BigInt,     -- 父角色ID
    level: Integer,        -- 角色层级
}
-- 子角色自动继承父角色所有权限
```

#### 6.2 权限委托（可选功能）

```
用户A（委托人） → 委托给 → 用户B（受托人）
                                    ↓
                        用户B 临时获得 用户A 的部分权限
                        ↓
                    委托时间到期自动失效
```

---

### 七、前后端权限交互

#### 7.1 前端权限获取

```
登录成功 → 获取用户信息 + 角色列表 + 权限列表 + 菜单列表
        ↓
前端存储在 Vuex/Pinia
        ↓
路由守卫：根据菜单权限生成动态路由
        ↓
按钮控制：根据按钮权限标识控制显隐
        ↓
接口请求：请求头携带 Token
```

#### 7.2 前端按钮权限控制

```javascript
// 方式一：自定义指令
<button v-permission="'user:add'">新增</button>

// 方式二：条件渲染
<button v-if="hasPermission('user:edit')">编辑</button>

// 方式三：权限验证函数
const canEdit = checkPermission('user:edit')
```

#### 7.3 权限变更实时感知

| 方案 | 实现方式 |
|------|----------|
| 轮询 | 前端每分钟拉取权限变更 |
| WebSocket | 权限变更时服务端推送 |
| 重新登录 | 强制重新登录 |

**推荐：WebSocket 推送 + 兜底轮询**

---

### 八、日志审计

#### 8.1 日志类型

| 日志类型 | 记录内容 | 存储周期 |
|----------|----------|----------|
| 登录日志 | 登录时间、IP、设备、结果 | 1年 |
| 操作日志 | 操作人、时间、具体操作、数据变更 | 1年 |
| 权限变更日志 | 变更人、变更时间、变更内容 | 3年 |
| 敏感操作日志 | 密码修改、资金操作、数据导出等 | 3年 |
| 异常日志 | 异常信息、堆栈、请求参数 | 6个月 |

#### 8.2 操作日志字段

```sql
sys_oper_log {
    id: BigInt,
    title: String,           -- 操作模块
    business_type: String,   -- 业务类型
    method: String,          -- 请求方法
    request_method: String,
    operator_type: String,   -- 操作类型
    oper_name: String,       -- 操作人
    oper_ip: String,        -- 操作IP
    oper_location: String,   -- 操作位置
    oper_url: String,        -- 请求URL
    oper_param: Text,        -- 请求参数
    json_result: Text,       -- 返回结果
    status: Integer,         -- 操作状态
    error_msg: Text,        -- 错误信息
    oper_time: DateTime,     -- 操作时间
}
```

---

### 九、扩展功能

#### 9.1 SSO 单点登录（预留）

- 支持 CAS、SAML、OAuth2.0 协议
- 统一认证中心

#### 9.2 第三方登录（预留）

- 微信、钉钉、企业微信扫码登录
- 第三方绑定本地账户

#### 9.3 API 开放平台（预留）

- 第三方应用授权
- AppKey + AppSecret 鉴权
- API 调用频率限制
- API 使用统计

---

### 十、移动端特殊说明

#### 10.1 导航栏配置

- 默认有首页、我的两个固定导航
- 中间位置导航可动态配置为中间凸起
- 底部导航通过后端 Vue 界面配置，按角色动态生成

#### 10.2 首页菜单配置

- 首页菜单通过后端配置，按角色动态展示
- 支持拖拽排序
- 支持分组管理

---

---

### 十一、数据字典实现

#### 11.1 数据库设计

##### 字典类型表 (sys_dict_type)

```sql
CREATE TABLE `sys_dict_type` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_name` varchar(100) NOT NULL COMMENT '字典名称',
  `dict_type` varchar(100) NOT NULL COMMENT '字典类型（唯一标识）',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `status` tinyint DEFAULT 1 COMMENT '状态 [0=停用, 1=正常]',
  `create_time` bigint DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint DEFAULT NULL COMMENT '更新时间',
  `delete_time` bigint DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dict_type` (`dict_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典类型表';
```

##### 字典数据表 (sys_dict_data)

```sql
CREATE TABLE `sys_dict_data` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_type_id` bigint NOT NULL COMMENT '字典类型ID',
  `dict_label` varchar(100) NOT NULL COMMENT '字典标签',
  `dict_value` varchar(100) NOT NULL COMMENT '字典值',
  `dict_code` varchar(100) DEFAULT NULL COMMENT '字典编码（业务使用）',
  `sort` int DEFAULT 0 COMMENT '排序',
  `status` tinyint DEFAULT 1 COMMENT '状态 [0=停用, 1=正常]',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_time` bigint DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint DEFAULT NULL COMMENT '更新时间',
  `delete_time` bigint DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_dict_type_id` (`dict_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典数据表';
```

#### 11.2 实体类

##### DictType.java

```java
@Data
@ApiModel("字典类型实体")
public class DictType implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @ApiModelProperty("ID")
    private Long id;

    @ApiModelProperty("字典名称")
    private String dictName;

    @ApiModelProperty("字典类型")
    private String dictType;

    @ApiModelProperty("备注")
    private String remark;

    @ApiModelProperty("状态 [0=停用, 1=正常]")
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    @ApiModelProperty("创建时间")
    private Long createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @ApiModelProperty("更新时间")
    private Long updateTime;

    @TableLogic
    @ApiModelProperty("删除时间")
    private Long deleteTime;
}
```

##### DictData.java

```java
@Data
@ApiModel("字典数据实体")
public class DictData implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @ApiModelProperty("ID")
    private Long id;

    @ApiModelProperty("字典类型ID")
    private Long dictTypeId;

    @ApiModelProperty("字典标签")
    private String dictLabel;

    @ApiModelProperty("字典值")
    private String dictValue;

    @ApiModelProperty("字典编码")
    private String dictCode;

    @ApiModelProperty("排序")
    private Integer sort;

    @ApiModelProperty("状态 [0=停用, 1=正常]")
    private Integer status;

    @ApiModelProperty("备注")
    private String remark;

    @TableField(fill = FieldFill.INSERT)
    @ApiModelProperty("创建时间")
    private Long createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @ApiModelProperty("更新时间")
    private Long updateTime;

    @TableLogic
    @ApiModelProperty("删除时间")
    private Long deleteTime;
}
```

#### 11.3 Service 实现要点

```java
@Service
public class DictDataServiceImpl implements IDictDataService {

    // 按类型ID查询（带缓存）
    @Cacheable(value = "dict", key = "#dictTypeId")
    @Override
    public List<DictData> listByTypeId(Long dictTypeId) {
        return list(new LambdaQueryWrapper<DictData>()
                .eq(DictData::getDictTypeId, dictTypeId)
                .eq(DictData::getStatus, 1)
                .orderByAsc(DictData::getSort));
    }

    // 按类型编码查询
    @Cacheable(value = "dict", key = "#dictTypeCode")
    @Override
    public List<DictData> listByTypeCode(String dictTypeCode) {
        DictType dictType = dictTypeService.getOne(new LambdaQueryWrapper<DictType>()
                .eq(DictType::getDictType, dictTypeCode));
        if (dictType == null) {
            return Collections.emptyList();
        }
        return listByTypeId(dictType.getId());
    }

    // 增删改时清除缓存
    @CacheEvict(value = "dict", allEntries = true)
    @Override
    public boolean add(DictDataDTO dto) { ... }

    @CacheEvict(value = "dict", allEntries = true)
    @Override
    public boolean update(DictDataDTO dto) { ... }

    @CacheEvict(value = "dict", allEntries = true)
    @Override
    public boolean delete(Long id) { ... }
}
```

#### 11.4 接口列表

| 接口 | 方法 | 说明 |
|------|------|------|
| /system/dict/type/page | GET | 分页查询字典类型 |
| /system/dict/type/list | GET | 获取所有正常类型 |
| /system/dict/type | POST | 新增字典类型 |
| /system/dict/type | PUT | 修改字典类型 |
| /system/dict/type/{id} | DELETE | 删除字典类型 |
| /system/dict/data/page | GET | 分页查询字典数据 |
| /system/dict/data/type/{dictTypeId} | GET | 按类型ID查询 |
| /system/dict/data/typeCode/{dictTypeCode} | GET | 按类型编码查询 |
| /system/dict/data | POST | 新增字典数据 |
| /system/dict/data | PUT | 修改字典数据 |
| /system/dict/data/{id} | DELETE | 删除字典数据 |

#### 11.5 前端工具函数

```typescript
// 字典缓存
const dictCache = new Map<string, any[]>()

// 获取字典数据
export async function getDictData(dictTypeCode: string): Promise<any[]> {
  if (dictCache.has(dictTypeCode)) {
    return dictCache.get(dictTypeCode)!
  }
  const res = await getDictDataByTypeCode(dictTypeCode)
  if (res.code === 200) {
    dictCache.set(dictTypeCode, res.data)
  }
  return res.data || []
}

// 获取字典标签
export function getDictLabel(dictTypeCode: string, dictValue: string): string {
  const dictData = dictCache.get(dictTypeCode) || []
  const item = dictData.find((d: any) => d.dictValue === dictValue)
  return item ? item.dictLabel : dictValue
}
```

---

### 附录：版本历史

| 版本 | 更新内容 |
|------|----------|
| 0.0.1 | 初版，基础功能列举 |
| 0.0.2 | 完善数据库设计、补全安全机制、增加缓存策略、添加审计日志、完善租户权限 |
| 0.0.3 | 新增数据字典完整实现方案 |
