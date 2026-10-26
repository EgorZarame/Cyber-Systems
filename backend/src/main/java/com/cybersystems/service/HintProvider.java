package com.cybersystems.service;

import java.util.List;
import java.util.Map;

/** Откуда берутся подсказки игроку. Сейчас это ai-service. */
public interface HintProvider {

    /**
     * @param program блоки игрока: строки move/left/right или циклы {type: loop, count, body}
     * @param attempts номер попытки на этом уровне, от него зависит подробность подсказки
     */
    Map<String, Object> hint(String levelId, List<Object> program, int attempts);
}
