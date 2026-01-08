// eventBus.js
class EventBus {
  events = {};
  on(type, fn) {
    (this.events[type] ||= []).push(fn);
  }
  emit(type, payload) {
    this.events[type]?.forEach(fn => fn(payload));
  }
  off(type, fn) {
    this.events[type] = (this.events[type] || []).filter(f => f !== fn);
  }
}
const eventBus = new EventBus();
export default eventBus;
// useEffect(() => {
//   const handler = (v) => console.log(v);
//   eventBus.on('CHANGE', handler);
//   return () => eventBus.off('CHANGE', handler);
// }, []);