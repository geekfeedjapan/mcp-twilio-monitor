# Twilio Monitor MCP Server

[English](https://github.com/geekfeedjapan/mcp-twilio-monitor/blob/main/README.md) | [日本語](https://github.com/geekfeedjapan/mcp-twilio-monitor/blob/main/README.ja.md)

Twilio Monitor APIをラップしたMCP（Model Context Protocol）サーバーです。Claude CodeなどのMCPクライアントから、Twilioのアラートやイベントを直接取得できます。

## クイックスタート

npxで即座に利用開始（インストール不要）：

```bash
npx @geekfeed/mcp-twilio-monitor
```

## 機能

- ✅ Twilioモニターアラートの一覧取得・詳細確認
- ✅ Twilioモニターイベントの一覧取得・詳細確認
- ✅ 日付範囲、ログレベルなどでのフィルタリング
- ✅ Claude Codeやその他のMCPクライアントで動作
- ✅ npxでインストール不要で即利用可能

## セットアップ

### Twilio認証情報の取得

設定前に、[Twilioコンソール](https://console.twilio.com/)から認証情報を取得してください：
1. ダッシュボードで **Account SID** と **Auth Token** を確認
2. 以下の設定でこれらの値を使用します

### 設定方法（すべてのMCPクライアントで利用可能）

このサーバーは、**Claude Code**、**Claude Desktop**、**Cline**、**Continue**など、すべてのMCP対応クライアントで動作します。

**Claude Codeでの設定例** (`.mcp.json`):

```json
{
  "mcpServers": {
    "twilio-monitor": {
      "command": "npx",
      "args": ["@geekfeed/mcp-twilio-monitor"],
      "env": {
        "TWILIO_ACCOUNT_SID": "your_account_sid",
        "TWILIO_AUTH_TOKEN": "your_auth_token"
      }
    }
  }
}
```

**他のMCPクライアント**でも同じ設定構造を使用します。主な設定ファイルの場所：
- **Claude Desktop** (macOS): `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop** (Windows): `%APPDATA%\Claude\claude_desktop_config.json`
- **Cline**: VS Code設定 → "Cline: MCP Settings"
- **Continue**: Continue設定 → `experimental.modelContextProtocolServers`

### その他のインストール方法

npxの代わりにパッケージをインストールする場合：

```bash
# ローカルインストール
npm install @geekfeed/mcp-twilio-monitor

# グローバルインストール
npm install -g @geekfeed/mcp-twilio-monitor
```

その後、コマンドとして `node /path/to/node_modules/@geekfeed/mcp-twilio-monitor/dist/index.js` または `mcp-twilio-monitor`（グローバルインストールの場合）を使用してください。

## 利用可能なツール

### 1. list_alerts

Twilioアカウントで問題が検出された際に生成されたアラートの一覧を取得します。

**パラメータ:**
- `limit` (number, 省略可): 取得する最大件数（デフォルト: 20, 最大: 1000）
- `logLevel` (string, 省略可): ログレベルでフィルタ: `error`, `warning`, `notice`, `debug`
- `startDate` (string, 省略可): この日付以降に作成されたアラートをフィルタ（ISO 8601形式: YYYY-MM-DD）
- `endDate` (string, 省略可): この日付以前に作成されたアラートをフィルタ（ISO 8601形式: YYYY-MM-DD）

### 2. get_alert

特定のアラートの詳細をSIDで取得します。

**パラメータ:**
- `alertSid` (string, 必須): 取得するアラートのSID

### 3. list_events

Twilioアカウントで発生した重要なイベントの一覧を取得します。

**パラメータ:**
- `limit` (number, 省略可): 取得する最大件数（デフォルト: 20, 最大: 1000）
- `actorSid` (string, 省略可): イベントを引き起こしたアクターのSIDでフィルタ
- `eventType` (string, 省略可): イベントタイプでフィルタ（例: 'account.updated', 'call.created'）
- `resourceSid` (string, 省略可): 影響を受けたリソースのSIDでフィルタ
- `sourceIpAddress` (string, 省略可): 送信元IPアドレスでフィルタ
- `startDate` (string, 省略可): この日付以降に作成されたイベントをフィルタ（ISO 8601形式: YYYY-MM-DD）
- `endDate` (string, 省略可): この日付以前に作成されたイベントをフィルタ（ISO 8601形式: YYYY-MM-DD）

### 4. get_event

特定のイベントの詳細をSIDで取得します。

**パラメータ:**
- `eventSid` (string, 必須): 取得するイベントのSID

## 使用例

Claude Codeで設定後、自然言語でTwilioモニターデータとやり取りできます：

```
直近10件の通話から最新のエラーアラートを表示してください
```

```
今日発生したすべてのイベントを取得してください
```

```
アラート NO12345678901234567890123456789012 の詳細を表示してください
```

## トラブルシューティング

### 認証エラー
- `TWILIO_ACCOUNT_SID` と `TWILIO_AUTH_TOKEN` が正しく設定されているか確認してください
- [Twilioコンソール](https://console.twilio.com/)で認証情報を確認してください
- 認証情報に余分なスペースや引用符が含まれていないか確認してください

### 接続エラー
- ネットワーク接続を確認してください
- [status.twilio.com](https://status.twilio.com)でTwilio APIのステータスを確認してください
- ファイアウォールがTwilio APIへの外部接続を許可しているか確認してください

## 必要要件

- Node.js 14以上
- Monitor APIアクセスが有効なTwilioアカウント

## 作者

**Shinji Uchi / GeekFeed Co.,Ltd.**

- ウェブサイト: https://www.geekfeed.co.jp

## ライセンス

MIT
