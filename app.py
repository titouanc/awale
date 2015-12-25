import asyncio
from autobahn.asyncio.wamp import ApplicationSession, ApplicationRunner
from operator import itemgetter
from functools import partial
import uuid
import traceback


class Game:
    def __init__(self, app, key):
        self.app, self.key = app, key
        self.grid = [4 for i in range(12)]
        self.hand = 0
        self.players = [{
            'username': None,
            'ready': False,
            'captures': 0,
        } for i in range(2)]
        self.playing, self.finished = False, False

    def add_player(self, username):
        player = self.players[0] if self.empty else self.players[1]
        player['username'] = username
        self.publish()

    @property
    def empty(self):
        a, b = self.p('username')
        return not (a or b)

    @property
    def complete(self):
        a, b = self.p('username')
        return a and b

    @property
    def current_player(self):
        return self.self.players[self.hand]['username']

    def p(self, prop):
        return map(itemgetter(prop), self.players)

    def state(self):
        return {
            'grid': self.grid,
            'hand': self.hand,
            'players': self.players,
            'playing': self.playing,
            'finished': self.finished,
        }

    def ready(self, username):
        for p in self.players:
            print(username, p)
            if p['username'] == username:
                p['ready'] = True
                self.publish()
                return
        raise Exception("NOT IN THE GAME")

    def publish(self):
        self.app.publish('game.'+self.key, self.state())

    def publish_cell(self, cell_idx, suffix=''):
        self.app.publish('game.{}.{}{}'.format(self.key, cell_idx, suffix),
                         self.grid[cell_idx])

    def finish(self):
        self.finished = True
        self.publish()

    def play(self, i):
        if self.playing or i // 6 != self.hand:
            raise Exception("Not your turn")
        n = self.grid[i]
        if n == 0:
            raise Exception("Cannot play empty cell")

        self.playing = True

        # Take all and distribute in consecutive cells
        self.grid[i] = 0
        self.publish_cell(i, '.play')
        for j in range(n):
            k = (i+j+1) % 12
            self.grid[k] += 1
            self.publish_cell(k)
            yield from asyncio.sleep(0.3)

        # If the last drop was on the adversary side
        last = (i+n) % 12
        if last//6 != self.hand:
            # Go back and take, while the cell has 2 or 3 grains
            for j in range(12):
                k = (i+n-j) % 12
                m = self.grid[k]
                if m in [2, 3]:
                    self.grid[k] = 0
                    self.players[self.hand]['captures'] += m
                    self.publish_cell(k, '.take')
                else:
                    break

        # Update turn and publish
        self.hand = (self.hand + 1) % 2
        self.playing = False
        self.publish()

        score = self.p('score')
        if sum(score) == 48 or max(score) > 24:
            self.finish()

    def register(self):
        _ = lambda s: ('game.{}.'+s).format(self.key)
        yield from self.app.register(self.state, _('state'))
        yield from self.app.register(self.ready, _('ready'))
        for i in range(12):
            yield from self.app.register(partial(self.play, i), _(str(i)+'.play'))
        print("====== game.{} REGISTERED ======".format(self.key))


class Component(ApplicationSession):
    """
    An application component that publishes an event every second.
    """

    def join_game(self, username):
        try:
            available = list(filter(lambda g: not g.complete, self.games))
            if not available:
                key = str(uuid.uuid4())
                g = Game(self, key)
                yield from g.register()
                self.games.append(g)
            else:
                g = available[0]
            g.add_player(username)
            return g.key
        except:
            traceback.print_exc()

    @asyncio.coroutine
    def onJoin(self, details):
        self.games = []
        yield from self.register(self.join_game, 'join_game')


if __name__ == '__main__':
    runner = ApplicationRunner('ws://127.0.0.1:8080/ws',
                               'awale',
                               debug_wamp=True, debug=True)
    runner.run(Component)
