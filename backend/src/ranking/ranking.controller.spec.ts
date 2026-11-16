import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from './ranking.controller.js';
import { RankingService } from './ranking.service.js';

describe('RankingController', () => {
  let controller: RankingController;

  const rankingServiceMock = {
    buscarPorTorneo: vi.fn().mockResolvedValue({
      torneo: {
        id: 2,
        nombre: 'Torneo FIFA 26',
      },
      ranking: [],
    }),
  };

  beforeEach(async () => {
    rankingServiceMock.buscarPorTorneo.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [
        {
          provide: RankingService,
          useValue: rankingServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RankingController>(RankingController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debería consultar el ranking de un torneo', async () => {
    const respuesta = await controller.buscarPorTorneo(2);

    expect(rankingServiceMock.buscarPorTorneo).toHaveBeenCalledWith(2);
    expect(respuesta.torneo.id).toBe(2);
  });
});
