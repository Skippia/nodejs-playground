# Node.js Playground

Учебный проект для изучения ядра Node.js. Содержит HTTP-сервер и набор модулей-примеров, демонстрирующих работу со встроенными API: `path`, `os`, `process`, `url`, `events`, `stream`, `fs`, `cluster`.

## Требования

- **Node.js** >= 14
- **npm** >= 6

## Установка и запуск

```bash
# Клонирование репозитория
git clone <url> && cd nodejs-playground

# Установка зависимостей
npm install

# Запуск HTTP-сервера (с автоперезагрузкой через nodemon)
npm start
```

Сервер запустится на `http://localhost:3000`.

## Структура проекта

```
nodejs-playground/
├── about.html                 # HTML-страница для маршрута /about
├── package.json
├── src/
│   ├── server.js              # HTTP-сервер
│   └── modules/
│       ├── path.js            # Модуль path
│       ├── os.js              # Модуль os
│       ├── process.js         # Модуль process
│       ├── url.js             # Модуль url
│       ├── event.js           # EventEmitter
│       ├── stream.js          # Streams + pipe
│       ├── file.js            # Файловая система (fs)
│       ├── cluster.js         # Кластеризация
│       ├── async-iterator.js  # AsyncIterator (events, streams, pipeline)
│       ├── bigint.js          # Float precision & BigInt
│       ├── json-stream.js     # Streaming large JSON (SAX pattern)
│       ├── stream-backpressure.js # Stream backpressure deep dive
│       ├── stream-copy.js     # Implementing pipe() with async iterators
│       ├── stream-modes.js    # Flowing vs Paused modes
│       ├── uncaught-exception.js  # Graceful shutdown on errors
│       └── text.txt           # Тестовый файл (результат работы file.js)
└── .gitignore
```

## HTTP-сервер

**Файл:** `src/server.js`

Простой HTTP-сервер на модуле `http` без фреймворков. Объекты `req` (readable stream) и `res` (writable stream) обрабатываются вручную.

### Маршруты

| Метод | URL      | Описание                                                                 |
|-------|----------|--------------------------------------------------------------------------|
| GET   | `/home`  | Возвращает HTML `<h1> Hello from Node.js </h1>`                         |
| GET   | `/about` | Читает и отдаёт файл `about.html` через `fs.readFile`                   |
| POST  | любой    | Собирает тело запроса из чанков, извлекает значение и возвращает в HTML   |
| GET   | другие   | Возвращает `404 Page not found`                                          |

### Пример POST-запроса

```bash
curl -X POST http://localhost:3000 -d "message=hello"
# => <h1> Ваше сообщение: hello </h1>
```

## Модули

### path.js

**Файл:** `src/modules/path.js` | **Запуск:** `npm run path`

Демонстрирует разницу между `path.join` и `path.resolve`:

- **`path.join(...segments)`** -- просто соединяет сегменты через разделитель ОС. Возвращает относительный или абсолютный путь в зависимости от входных данных.
- **`path.resolve(...segments)`** -- всегда возвращает абсолютный путь. Обрабатывает сегменты справа налево: при обнаружении абсолютного сегмента предшествующие игнорируются.

```js
path.join("dir", "subdir", "file.txt");       // 'dir/subdir/file.txt'
path.resolve("dir", "subdir", "file.txt");     // '/абсолютный/путь/dir/subdir/file.txt'
path.resolve(__dirname, "/subdir", "file.txt"); // '/subdir/file.txt'
```

Также упоминается `path.parse(fullPath)`, возвращающий объект `{ root, dir, base, ext, name }`.

### os.js

**Файл:** `src/modules/os.js` | **Запуск:** `npm run os`

Работа с информацией об операционной системе:

- `os.platform` -- платформа (`linux`, `darwin`, `win32`)
- `os.arch()` -- архитектура процессора (`x64`, `arm64`)
- `os.cpus()` -- массив ядер CPU (модель, скорость, загрузка)
- `os.cpus().length` -- количество логических ядер

Пример итерации по ядрам для демонстрации идеи распараллеливания задач.

### process.js

**Файл:** `src/modules/process.js` | **Запуск:** `npm run process`

Работа с переменными окружения и аргументами CLI:

- **`process.env.PORT`** -- переменная из файла `.env`, загружаемая через пакет `dotenv`
- **`process.env.NODE_ENV`** -- переменная, передаваемая через `cross-env` в npm-скрипте:
  ```bash
  cross-env NODE_ENV=production nodemon ./src/modules/process.js
  ```
- **`process.argv`** -- массив аргументов командной строки:
  ```js
  // npm run process hello  =>
  // ['/usr/bin/node', '/path/to/process.js', 'hello']
  ```

### url.js

**Файл:** `src/modules/url.js` | **Запуск:** `npm run url`

Разбор URL с помощью глобального конструктора `new URL()`:

```js
const url = new URL('http://localhost:8080/users?id=5123')
// {
//   href:         'http://localhost:8080/users?id=5123',
//   origin:       'http://localhost:8080',
//   protocol:     'http:',
//   host:         'localhost:8080',
//   hostname:     'localhost',
//   port:         '8080',
//   pathname:     '/users',
//   search:       '?id=5123',
//   searchParams: URLSearchParams { 'id' => '5123' }
// }
```

### event.js

**Файл:** `src/modules/event.js` | **Запуск:** `npm run event`

Паттерн «событие-подписчик» через `EventEmitter`:

```js
const emitter = new (require('events'))()

emitter.on('message', (data, second, third) => {
  console.log(`${data} | ${second} | ${third}`)
})

emitter.emit('message', 'some data', 'second arg', 'third arg')
```

Доступные методы: `on`, `once`, `removeListener(event, callback)`, `removeAllListeners()`.

Области применения: HTTP, WebSockets, long polling, кластеры.

### stream.js

**Файл:** `src/modules/stream.js` | **Запуск:** `npm run stream`

HTTP-сервер, который отдаёт содержимое файла через потоки:

```js
const readableStream = fs.createReadStream(path.join(__dirname, 'file.txt'))
readableStream.pipe(res)
```

`pipe` связывает readable и writable stream: readable не читает следующий чанк, пока writable не обработал предыдущий (backpressure).

### file.js

**Файл:** `src/modules/file.js` | **Запуск:** `npm run file`

Работа с файловой системой (`fs`). Включает кастомную реализацию `promisify`:

```js
function promisify(fn) {
  return (...args) => {
    return new Promise((res, rej) => {
      fn(...args, (err, data) => {
        if (err) { rej(err); return }
        res(data)
      })
    })
  }
}
```

Применение -- цепочка записи в файл:

```js
writeFilePromise(path.join(__dirname, 'text.txt'), 'data')
  .then(() => promiseAppendFile(path.join(__dirname, 'text.txt'), '\n123'))
  .then(() => promiseAppendFile(path.join(__dirname, 'text.txt'), '\n456'))
  .then(() => promiseAppendFile(path.join(__dirname, 'text.txt'), '\n789'))
  .catch(e => console.log('Catch some error!', e))
```

Также содержит закомментированный пример `fs.mkdir` с опцией `{ recursive: true }`.

### cluster.js

**Файл:** `src/modules/cluster.js` | **Запуск:** `npm run cluster`

Кластеризация Node.js-приложения для использования нескольких ядер CPU:

1. **Мастер-процесс** (`cluster.isMaster`) создаёт форки по числу ядер (`os.cpus().length - 2`).
2. **Воркеры** выполняют полезную работу (в примере -- `setInterval` каждые 5 секунд).
3. **Автовосстановление:** при завершении воркера (`cluster.on('exit')`) мастер создаёт новый форк.

```bash
# Запуск (без nodemon, т.к. cluster управляет процессами сам)
npm run cluster

# Завершение конкретного воркера
kill <pid>
# => мастер автоматически создаст новый воркер
```

### async-iterator.js

**Файл:** `src/modules/async-iterator.js` | **Запуск:** `npm run async-iterator`

Async iterators (`for await...of`) in Node.js:

- **`events.on(emitter, event)`** — returns an async iterable over event emissions. Processes events sequentially (not suitable for concurrent workloads like HTTP servers).
- **Readable streams** implement `Symbol.asyncIterator`, so `for await (const chunk of readable)` replaces manual `data`/`end` event handling.
- **`stream.Readable.from(iterable)`** — creates a readable stream from any sync/async iterable.
- **`pipeline()` with generator functions** — generators act as transform steps in a pipeline.

### bigint.js

**Файл:** `src/modules/bigint.js` | **Запуск:** `npm run bigint`

IEEE 754 precision limits and BigInt:

- `Number.MAX_SAFE_INTEGER` = 2^53 - 1. Larger integers silently lose precision.
- `JSON.parse()` also loses precision for large numbers (JSON `number` type → JS `Number`).
- **BigInt** — native arbitrary-precision integers. Create with `200n` or `BigInt('200')`.
- Cannot mix BigInt and Number in arithmetic. JSON doesn't support BigInt natively.
- Use `json-bigint` library for parsing JSON with large numbers.

### json-stream.js

**Файл:** `src/modules/json-stream.js` | **Запуск:** `npm run json-stream`

Streaming large JSON files without loading into memory:

- **SAX pattern** (Simple API for XML) — event-driven parsing, O(1) memory.
- **JSONStream** (npm) — SAX-based JSON parser. `parse('.')` streams array elements; `parse('list.*')` extracts specific nested arrays.
- **NDJSON** (newline-delimited JSON) — simplest streaming format, parse line by line with `readline`.

### stream-backpressure.js

**Файл:** `src/modules/stream-backpressure.js` | **Запуск:** `npm run stream-backpressure`

Deep dive into stream backpressure:

- `writable.write(chunk)` returns `false` when buffer >= `highWaterMark` → producer must pause until `drain` event.
- **Without backpressure** on a 2.2GB file: ~980MB memory. **With backpressure**: ~56MB (17x difference).
- `pipe()` and `pipeline()` handle backpressure automatically.
- Missing backpressure handling is a potential DoS vector.

### stream-copy.js

**Файл:** `src/modules/stream-copy.js` | **Запуск:** `npm run stream-copy`

Implementing `pipe()` manually with async iterators:

- `_write(dest, chunk)` — returns a Promise; resolves immediately if buffer has space, waits for `drain` otherwise.
- `streamCopy(src, dest)` — uses `for await...of` to read chunks + `_write()` for backpressure-safe writing.
- Demonstrates the core mechanism that `pipe()` implements internally.

### stream-modes.js

**Файл:** `src/modules/stream-modes.js` | **Запуск:** `npm run stream-modes`

Flowing vs Paused mode in readable streams:

- All readable streams start in **paused** mode. If you don't switch to flowing mode, `end` never fires (request hangs!).
- **Flowing mode** triggers: `data` event, `pipe()`, `resume()`, or `for await...of`.
- **Paused mode**: use `readable` event + `read()` to pull data manually.
- Interactive demo server on port 3001 with 4 routes demonstrating each approach.

### uncaught-exception.js

**Файл:** `src/modules/uncaught-exception.js` | **Запуск:** `npm run uncaught-exception`

Graceful shutdown on uncaught errors:

- `process.on('uncaughtException')` / `process.on('unhandledRejection')` — last resort handlers.
- `graceful()` helper: catches errors, stops accepting new connections, sets `Connection: close`, exits after timeout.
- Without graceful shutdown, a single error kills all in-flight requests.
- In production, combine with process managers (PM2, systemd, K8s) for auto-restart.

## npm-скрипты

| Скрипт          | Команда                                                     | Описание                         |
|-----------------|-------------------------------------------------------------|----------------------------------|
| `npm start`     | `nodemon ./src/server.js`                                   | Запуск HTTP-сервера              |
| `npm run cluster` | `node ./src/modules/cluster.js`                           | Запуск кластера                  |
| `npm run event`  | `nodemon ./src/modules/event.js`                           | Пример EventEmitter              |
| `npm run file`   | `nodemon ./src/modules/file.js`                            | Пример работы с fs               |
| `npm run os`     | `nodemon ./src/modules/os.js`                              | Информация об ОС                 |
| `npm run path`   | `nodemon ./src/modules/path.js`                            | Примеры path.join / path.resolve |
| `npm run process`| `cross-env NODE_ENV=production nodemon ./src/modules/process.js` | Переменные окружения        |
| `npm run stream` | `nodemon ./src/modules/stream.js`                          | Потоки и pipe                    |
| `npm run url`    | `nodemon ./src/modules/url.js`                             | Разбор URL                       |
| `npm run async-iterator` | `node ./src/modules/async-iterator.js`           | AsyncIterator (events, streams)  |
| `npm run bigint` | `node ./src/modules/bigint.js`                              | Float precision & BigInt         |
| `npm run json-stream` | `node ./src/modules/json-stream.js`                    | Streaming large JSON             |
| `npm run stream-backpressure` | `node ./src/modules/stream-backpressure.js`     | Backpressure deep dive           |
| `npm run stream-copy` | `node ./src/modules/stream-copy.js`                    | pipe() via async iterators       |
| `npm run stream-modes` | `node ./src/modules/stream-modes.js`                  | Flowing vs Paused modes          |
| `npm run uncaught-exception` | `node ./src/modules/uncaught-exception.js`       | Graceful error shutdown          |

## Зависимости

### Production

| Пакет      | Назначение                                                    |
|------------|---------------------------------------------------------------|
| `cross-env`| Кроссплатформенная установка переменных окружения в скриптах   |
| `dotenv`   | Загрузка переменных окружения из файла `.env`                 |
| `http`     | Заглушка безопасности (`0.0.1-security`); реальный `http` -- встроенный модуль Node.js |
| `mongodb`  | Драйвер MongoDB для Node.js                                  |

### Development

| Пакет      | Назначение                                                    |
|------------|---------------------------------------------------------------|
| `nodemon`  | Автоматическая перезагрузка при изменении файлов              |
