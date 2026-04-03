# Testing gRPC with Postman

## Import (repo files)

You can import these into Postman (**Import** → drag files or **Upload Files**):

| File | Purpose |
|------|--------|
| [`Wallet-Assessment.postman_collection.json`](./Wallet-Assessment.postman_collection.json) | Collection with all five flows (see note below). |
| [`Wallet-Assessment.postman_environment.json`](./Wallet-Assessment.postman_environment.json) | Variables: `userGrpcUrl`, `walletGrpcUrl`, `userId`, `walletId`. |

**Note:** Postman’s export format for **native gRPC** requests is limited, so the collection uses **HTTP stubs** (requests to `httpbin.org`) whose **descriptions** contain the real **gRPC JSON messages** and **grpcurl** commands. Use those descriptions when you create a **New → gRPC** request, or run grpcurl directly.

---

Postman can call your services over **gRPC** using the `.proto` files in `packages/proto/proto/`. Use a **recent Postman desktop** build (gRPC is not fully supported in all older versions).

## Before you start

1. Run **wallet-service** then **user-service** (same as in the main README).
2. Note the ports: **user** `50051`, **wallet** `50052`.

## 1. Create a collection

1. **New → Collection** (or **Collections → +**).
2. Name it e.g. `Wallet assessment`.
3. Postman uses **multi-protocol collections** for gRPC—saving a gRPC request into this collection is enough.

## 2. User service requests (`50051`)

### Import the proto

1. **New → gRPC** (or add a **gRPC** request to your collection).
2. **Server URL:** `grpc://127.0.0.1:50051`  
   - Local Nest servers use **plaintext** gRPC, not TLS—leave TLS **off** unless you have enabled it yourself.
3. Under the service definition / API definition area, choose **import** and select:

   `packages/proto/proto/user.proto`

   If Postman asks for an **import path** / **root**, set it to the folder that **contains** `user.proto`:

   `…/backend-assessment/packages/proto/proto`

4. Pick the method from the dropdown, e.g. **`UserService` → `CreateUser`**.

### `CreateUser`

- **Message (JSON):**

  ```json
  {
    "email": "alice@example.com",
    "name": "Alice"
  }
  ```

- Click **Invoke**.
- Copy the returned `id` (user id) for the next calls.

### `GetUserById`

- Switch method to **`GetUserById`** (same server URL and same `user.proto`).
- **Message:**

  ```json
  {
    "id": "<paste-user-id-here>"
  }
  ```

After each request: **Save** (or **Save As**) and add it under your collection so you have a reusable folder, e.g. `User service`.

## 3. Wallet service requests (`50052`)

Create a **new gRPC request** (or duplicate the user one and change everything below).

1. **Server URL:** `grpc://127.0.0.1:50052`
2. Import **`packages/proto/proto/wallet.proto`** (import path / root: same `proto` folder as above).
3. Add saved requests to a folder e.g. `Wallet service`.

| Method           | Example message (JSON) |
|------------------|-------------------------|
| `CreateWallet`   | `{ "user_id": "<user-uuid>" }` |
| `GetWallet`      | `{ "id": "<wallet-uuid>" }` |
| `CreditWallet`   | `{ "id": "<wallet-uuid>", "amount": "100.50" }` |
| `DebitWallet`    | `{ "id": "<wallet-uuid>", "amount": "25" }` |

**Wallet id:** After `CreateUser`, a wallet is created automatically, but that response is on the user call. Easiest ways to get `wallet.id`:

- Run **`CreateWallet`** with the same `user_id` (it is idempotent and returns the wallet), or  
- Use **Prisma Studio** (`cd packages/prisma && npx prisma studio`) and open the `Wallet` table.

## 4. Optional: collection variables

1. Edit your collection → **Variables**.
2. Add e.g. `user_id`, `wallet_id`, `user_grpc_url` (`grpc://127.0.0.1:50051`), `wallet_grpc_url` (`grpc://127.0.0.1:50052`).
3. In each request, use **`{{user_grpc_url}}`** in the URL field if Postman allows variables there, and put `{{user_id}}` in the JSON message body.

After **CreateUser**, paste the id into the `user_id` variable; after you have a wallet id, set `wallet_id`.

## 5. Sharing / repo-friendly export

Postman’s support for **exporting** gRPC requests inside collections has improved over time but can still differ by version.

- After you save each method into the collection, try **Collection → … → Export**.
- If gRPC requests do not appear in the export, keep this `postman/README.md` in the repo and commit your collection **when** your Postman version exports it successfully.

As a fallback, use the **Code snippet** (or equivalent) on a saved gRPC request to copy a **grpcurl** command—you can paste those into your notes or README.

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Connection refused | Services running? Wallet first, then user. Correct port per service. |
| Unknown method / proto errors | Correct `.proto` imported; import root = directory containing the file. |
| TLS / certificate errors | Use **plaintext** / disable TLS for local `grpc://127.0.0.1:…`. |
