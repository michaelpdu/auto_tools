/*
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Shumway;
(function (Shumway) {
    (function (AVM1) {
        var ActionsDataAnalyzer = (function () {
            function ActionsDataAnalyzer() {
            }
            ActionsDataAnalyzer.prototype.analyze = function (parser) {
                var actions = [];
                var labels = [0];
                var processedLabels = [true];

                // Parsing all actions we can reach. Every action will have next position
                // and conditional jump location.
                var queue = [0];
                while (queue.length > 0) {
                    var position = queue.shift();
                    if (actions[position]) {
                        continue;
                    }
                    parser.position = position;

                    while (!parser.eof && !actions[position]) {
                        var action = parser.readNext();
                        if (action.actionCode === 0) {
                            break;
                        }

                        var nextPosition = parser.position;

                        var item = {
                            action: action,
                            next: nextPosition,
                            conditionalJumpTo: -1
                        };

                        var jumpPosition = 0;
                        var branching = false;
                        var nonConditionalBranching = false;
                        switch (action.actionCode) {
                            case 138 /* ActionWaitForFrame */:
                            case 141 /* ActionWaitForFrame2 */:
                                branching = true;

                                // skip is specified in amount of actions (instead of bytes)
                                var skipCount = action.actionCode === 138 /* ActionWaitForFrame */ ? action.args[1] : action.args[0];
                                parser.skip(skipCount);
                                jumpPosition = parser.position;
                                parser.position = nextPosition;
                                break;
                            case 153 /* ActionJump */:
                                nonConditionalBranching = true;
                                branching = true;
                                jumpPosition = nextPosition + action.args[0];
                                break;
                            case 157 /* ActionIf */:
                                branching = true;
                                jumpPosition = nextPosition + action.args[0];
                                break;
                            case 42 /* ActionThrow */:
                            case 62 /* ActionReturn */:
                            case 0 /* None */:
                                nonConditionalBranching = true;
                                branching = true;
                                jumpPosition = parser.length;
                                break;
                        }
                        if (branching) {
                            if (jumpPosition < 0 || jumpPosition > parser.length) {
                                console.error('jump outside the action block;');
                                jumpPosition = parser.length;
                            }
                            if (nonConditionalBranching) {
                                item.next = jumpPosition;
                            } else {
                                item.conditionalJumpTo = jumpPosition;
                            }
                            if (!processedLabels[jumpPosition]) {
                                labels.push(jumpPosition);
                                queue.push(jumpPosition);
                                processedLabels[jumpPosition] = true;
                            }
                        }

                        actions[position] = item;
                        if (nonConditionalBranching) {
                            break;
                        }
                        position = nextPosition;
                    }
                }

                // Creating blocks for every unique label
                var blocks = [];
                labels.forEach(function (position) {
                    if (!actions[position]) {
                        return;
                    }
                    var items = [];
                    var lastPosition = position;

                    do {
                        var item = actions[lastPosition];
                        items.push(item);
                        lastPosition = item.next;
                    } while(!processedLabels[lastPosition] && actions[lastPosition]);

                    blocks.push({
                        label: position,
                        items: items,
                        jump: lastPosition
                    });
                });
                return {
                    actions: actions,
                    blocks: blocks,
                    dataId: parser.dataId
                };
            };
            return ActionsDataAnalyzer;
        })();
        AVM1.ActionsDataAnalyzer = ActionsDataAnalyzer;
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
})(Shumway || (Shumway = {}));
