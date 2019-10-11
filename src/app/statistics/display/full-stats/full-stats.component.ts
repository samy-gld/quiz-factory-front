import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import { Question } from '../../../model/IQuiz';
import { Observable } from 'rxjs';
import { Invitation } from '../../../model/IInvitation';
import { StatisticsService } from '../../services/statistics.service';

@Component({
    selector: 'app-full-stats',
    templateUrl: './full-stats.component.html',
    styleUrls: ['./full-stats.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullStatsComponent implements OnInit {

    @Input() quizId: number;
    questions$: Observable<Question[]>;
    invitations$: Observable<Invitation[]>;
    answersTab$: Observable<any[][]>;

    constructor(private statisticsService: StatisticsService) { }

    ngOnInit() {
        this.questions$     = this.statisticsService.questions$;
        this.invitations$   = this.statisticsService.invitations$;
        this.answersTab$    = this.statisticsService.getAnswerTab();
    }
}
