# Quy trình làm việc Prompt ↔ Response

## Mô hình tương tác

```
User (Prompt) → AI (Phân tích + Kế hoạch) → User (Xác nhận) → AI (Thực thi) → User (Kiểm tra)
```

## 3 chế độ hoạt động

### 1. Plan Mode (Đọc & Phân tích)
- **Mục đích**: Hiểu yêu cầu, nghiên cứu codebase, lập kế hoạch
- **Hành vi**:
  - Đọc file, grep, glob để khảo sát
  - Viết kế hoạch chi tiết từng bước
  - **KHÔNG** chỉnh sửa code hay chạy lệnh thay đổi
- **Ví dụ**: User hỏi "Tại sao web re-render?", AI đọc useTasks, KanbanBoard, phân tích nguyên nhân → trình bày kế hoạch fix

### 2. Execute Mode (Thực thi)
- **Mục đích**: Thực hiện các thay đổi theo kế hoạch đã duyệt
- **Hành vi**:
  - Tạo `todowrite` để track tiến độ
  - Sửa/tạo file theo từng bước
  - Chạy build verify sau mỗi thay đổi
  - Chỉ chuyển bước tiếp theo khi bước hiện tại hoàn thành
- **Ví dụ**: Sau khi user OK kế hoạch, AI sửa useTasks.ts → FilterPanel.tsx → KanbanBoard.tsx → build

### 3. Review Mode (Kiểm tra)
- **Mục đích**: Đảm bảo code sạch, build pass
- **Hành vi**:
  - `npm run build` kiểm tra TypeScript + bundle
  - Fix lỗi nếu có
  - Commit + push khi OK

## Cấu trúc prompt điển hình

### Prompt của User
```
Mô tả vấn đề / Yêu cầu tính năng
[Có thể kèm ảnh chụp màn hình hoặc mô tả chi tiết]
```

### Response của AI
1. **Phân tích**: Đọc codebase, xác định file liên quan
2. **Kế hoạch**: Trình bày giải pháp theo từng bước
3. **Chờ xác nhận**: "OK thực hiện?" — để user quyết định
4. **Thực thi**: Từng bước một, có `todowrite` theo dõi
5. **Xác nhận**: Build pass, commit, push

## Quy tắc làm việc

| Quy tắc | Mô tả |
|---------|-------|
| **1 bước 1 lần** | Mỗi lần chỉ làm 1 bước, chờ user xác nhận trước khi chuyển |
| **todowrite** | Luôn tạo todo list để track tiến độ |
| **Build verify** | Chạy `npm run build` sau mỗi thay đổi code |
| **Plan trước Execute** | Luôn lập kế hoạch chi tiết trước khi sửa code |
| **Commit khi xong** | Commit + push khi hoàn thành một milestone |
| **Đọc trước sửa** | Luôn đọc file trước khi edit (tránh conflict) |
| **Barrel export** | Cập nhật index.ts khi thêm/xoá component |

## Ví dụ thực tế

### Phiên 1: Xây dựng Filter Panel (04/06)

```
User: "Đổi filter từ hàng ngang sang panel phải multi-select"
AI:   → Đọc file types.ts, useTasks.ts, tasks-dashboard.tsx
      → Lập kế hoạch 8 bước
      → "OK thực hiện?"
User: "OK"
AI:   → Bước 1: cài checkbox (npx shadcn)
      → Bước 2: sửa types.ts
      → Bước 3: sửa useTasks.ts
      → ... (từng bước)
      → Build pass
      → "Done"
```

### Phiên 2: Fix re-render (04/06)

```
User: "Tại sao web re-render mỗi lần thao tác?"
AI:   → Phân tích useTasks (isLoading flash)
      → Phân tích KanbanBoard (no memo)
      → Phân tích FilterPanel (no memo, new references)
      → Lập kế hoạch 7 bước
      → "OK thực hiện?"
User: "Làm theo từng bước"
AI:   → Bước 1: useTasks (isInitialLoading)
      → Bước 2: FilterPanel (memo)
      → ... (từng bước)
      → Build pass → push
```

### Phiên 3: Redesign FilterPanel (04/06)

```
User: "Decore lại thanh tìm kiếm..."
AI:   → Hỏi ý tưởng (A/B/C/D)
User: "Phương án C (giữ nguyên panel phải, làm đẹp)"
AI:   → Lập kế hoạch 7 bước (push trước, làm sau)
      → Thực thi từng bước
      → Build pass → push
```

### Phiên 4: Auth-aware CTAs (04/06)

```
User: "Nút 'Tham gia'/'Bắt đầu' trả về tasks khi đã login"
AI:   → Đọc page.tsx, home.json → phát hiện href cứng
      → Lập kế hoạch
      → Thực thi: sửa page.tsx (async + check auth)
      → Build pass → push
```

## Tổng kết

Quy trình này giúp:
- **Tránh sai sót**: Kế hoạch được duyệt trước khi thực thi
- **Dễ theo dõi**: todo list + build verify sau mỗi bước
- **An toàn**: Git commit thường xuyên, mỗi milestone một commit
- **Rõ ràng**: User luôn biết AI đang làm gì và bước tiếp theo là gì
