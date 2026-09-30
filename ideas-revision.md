# Revisión Weather CLI

- [x] **Colores:** cyan (menú), amarillo (temp), verde/rojo (ok/error).
- [x] **AGENTS.md:** documentado `index.ts` como entrypoint funcional y las pruebas existentes.
- [ ] **Ciudades:** geocoding solo trae 1 resultado; nombres ambiguos pueden fallar.
- [ ] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
- [ ] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather-cli/`.
- [ ] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [ ] **Carga:** ¿hay estado de carga en las tareas asíncronas?
